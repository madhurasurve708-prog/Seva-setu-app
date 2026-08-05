from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

def test_cors_preflight_production_vs_development():
    print("Running CORS production vs development configuration tests...")
    # Let's write a dynamic test that builds a FastAPI app with our CORS middleware logic to test both conditions.
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    def create_test_app(allow_dev_mode: bool, cors_origins_env: str):
        test_app = FastAPI()
        
        # Replicate main.py CORS setup logic:
        cors_origins = []
        if cors_origins_env:
            cors_origins.extend([origin.strip() for origin in cors_origins_env.split(",") if origin.strip()])

        if allow_dev_mode:
            dev_origins = ["http://localhost:8081", "http://127.0.0.1:8081"]
            for origin in dev_origins:
                if origin not in cors_origins:
                    cors_origins.append(origin)

        test_app.add_middleware(
            CORSMiddleware,
            allow_origins=cors_origins,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            allow_headers=["*"],
        )
        
        @test_app.get("/test")
        def read_test():
            return {"ok": True}
            
        return test_app

    # Test Dev Mode Configuration
    print("  Testing Dev Mode Configuration...")
    dev_app = create_test_app(allow_dev_mode=True, cors_origins_env="")
    client = TestClient(dev_app)
    
    # 1. Test preflight OPTIONS request from http://localhost:8081
    response = client.options(
        "/test",
        headers={
            "Origin": "http://localhost:8081",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "x-dev-mode,x-dev-phone,x-dev-secret,authorization,content-type",
        }
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert response.headers.get("access-control-allow-origin") == "http://localhost:8081"
    assert "OPTIONS" in response.headers.get("access-control-allow-methods", "")
    assert "x-dev-mode" in response.headers.get("access-control-allow-headers", "").lower()
    assert response.headers.get("access-control-allow-credentials") == "true"
    print("    - http://localhost:8081 is allowed in development mode (PASS)")

    # 2. Test preflight OPTIONS request from http://127.0.0.1:8081
    response = client.options(
        "/test",
        headers={
            "Origin": "http://127.0.0.1:8081",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "x-dev-mode,x-dev-phone,x-dev-secret,authorization,content-type",
        }
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert response.headers.get("access-control-allow-origin") == "http://127.0.0.1:8081"
    print("    - http://127.0.0.1:8081 is allowed in development mode (PASS)")

    # Test Production Mode Configuration (ALLOW_DEV_MODE = False)
    print("  Testing Production Mode Configuration...")
    prod_app = create_test_app(allow_dev_mode=False, cors_origins_env="https://seva-setu-app.onrender.com")
    client = TestClient(prod_app)
    
    # 1. Test preflight OPTIONS request from production origin
    response = client.options(
        "/test",
        headers={
            "Origin": "https://seva-setu-app.onrender.com",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization,content-type",
        }
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert response.headers.get("access-control-allow-origin") == "https://seva-setu-app.onrender.com"
    assert response.headers.get("access-control-allow-credentials") == "true"
    print("    - Production origin https://seva-setu-app.onrender.com is allowed (PASS)")
    
    # 2. Test preflight OPTIONS request from localhost (should be blocked in production)
    response = client.options(
        "/test",
        headers={
            "Origin": "http://localhost:8081",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization,content-type",
        }
    )
    assert response.headers.get("access-control-allow-origin") is None
    print("    - localhost:8081 is blocked in production mode (PASS)")
    
    print("All CORS test scenarios passed successfully!")

if __name__ == "__main__":
    test_cors_preflight_production_vs_development()
