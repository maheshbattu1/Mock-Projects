import json
from auth.auth_utils import create_access_token

def test_graphql_health(client):
    """Test if GraphQL endpoint responds"""
    query = """
    query {
        hello
    }
    """
    response = client.post(
        "/graphql",
        json={"query": query}
    )
    assert response.status_code == 200
    assert "data" in response.json()

def test_protected_query_without_token(client):
    """Test that protected queries fail without a token"""
    query = """
    query {
        me {
            id
            name
            email
        }
    }
    """
    response = client.post(
        "/graphql",
        json={"query": query}
    )
    assert response.status_code == 200
    data = response.json()
    # The me query should return null without auth
    assert data["data"]["me"] is None

def test_protected_query_with_token(client, test_user):
    """Test that protected queries succeed with a valid token"""
    # Create a token for the test user
    token_data = {"sub": test_user.email, "user_id": test_user.id}
    token = create_access_token(token_data)
    
    query = """
    query {
        me {
            id
            name
            email
        }
    }
    """
    response = client.post(
        "/graphql",
        json={"query": query},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["me"] is not None
    assert data["data"]["me"]["email"] == test_user.email
