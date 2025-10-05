# Pull Request API Endpoints

This document describes the pull request endpoints that integrate with the GitHub API to fetch and manage user pull requests.

## Endpoints

### 1. Get Pull Requests from GitHub (Live Data)
**GET** `/api/pullrequests/user/:userId/github`

Fetches pull requests directly from GitHub API for a specific user.

**Parameters:**
- `userId` (path): User ID from the database

**Query Parameters:**
- `state` (optional): `all`, `open`, `closed` (default: `all`)
- `sort` (optional): `created`, `updated`, `popularity`, `long-running` (default: `created`)
- `direction` (optional): `asc`, `desc` (default: `desc`)
- `page` (optional): Page number (default: `1`)
- `per_page` (optional): Results per page (default: `30`, max: `100`)

**Response:**
```json
{
  "success": true,
  "message": "Pull requests fetched successfully",
  "data": {
    "total_count": 42,
    "incomplete_results": false,
    "pull_requests": [
      {
        "id": 123456789,
        "number": 42,
        "title": "Add new feature",
        "body": "Description of the pull request",
        "state": "open",
        "created_at": "2023-10-01T12:00:00Z",
        "updated_at": "2023-10-02T12:00:00Z",
        "closed_at": null,
        "merged_at": null,
        "html_url": "https://github.com/owner/repo/pull/42",
        "repository": {
          "id": 987654321,
          "name": "repo-name",
          "full_name": "owner/repo-name",
          "html_url": "https://github.com/owner/repo-name"
        },
        "user": {
          "login": "username",
          "avatar_url": "https://avatars.githubusercontent.com/u/123456?v=4",
          "html_url": "https://github.com/username"
        },
        "assignees": [],
        "labels": [],
        "additions": 150,
        "deletions": 25,
        "changed_files": 5,
        "mergeable": true,
        "merged": false,
        "draft": false
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 30,
      "total_count": 42,
      "total_pages": 2
    }
  }
}
```

### 2. Get Pull Requests from Database
**GET** `/api/pullrequests/user/:userId`

Fetches pull requests from the local database for a specific user.

**Parameters:**
- `userId` (path): User ID from the database

**Query Parameters:**
- `state` (optional): `all`, `open`, `closed`, `merged` (default: all states)
- `repo_name` (optional): Filter by repository name (partial match)
- `sort` (optional): Field to sort by (default: `pull_created_at`)
- `order` (optional): `asc`, `desc` (default: `desc`)
- `page` (optional): Page number (default: `1`)
- `limit` (optional): Results per page (default: `20`)

### 3. Sync Pull Requests from GitHub
**POST** `/api/pullrequests/user/:userId/sync`

Syncs all pull requests from GitHub API to the local database for a specific user.

**Parameters:**
- `userId` (path): User ID from the database

**Response:**
```json
{
  "success": true,
  "message": "Pull requests synced successfully",
  "data": {
    "synced_count": 15,
    "total_found": 20,
    "synced_pull_requests": [...]
  }
}
```

### 4. Get Pull Request Statistics
**GET** `/api/pullrequests/user/:userId/stats`

Fetches statistics for a user's pull requests from the local database.

**Parameters:**
- `userId` (path): User ID from the database

**Response:**
```json
{
  "success": true,
  "message": "User pull request statistics retrieved successfully",
  "data": {
    "total_prs": 25,
    "merged_prs": 20,
    "open_prs": 3,
    "closed_prs": 2,
    "total_additions": 5000,
    "total_deletions": 1200,
    "total_pull_points": 150,
    "total_merge_points": 400,
    "merge_rate": 80.00,
    "total_points": 550
  }
}
```

## Authentication

All endpoints require a valid user with a GitHub access token stored in the database. The access token is used to authenticate requests to the GitHub API.

## Error Responses

Common error responses:

```json
{
  "success": false,
  "message": "User not found"
}
```

```json
{
  "success": false,
  "message": "User GitHub access token not found. Please re-authenticate with GitHub."
}
```

```json
{
  "success": false,
  "message": "Invalid GitHub access token"
}
```

## Rate Limiting

GitHub API has rate limits:
- 5,000 requests per hour for authenticated requests
- 60 requests per hour for unauthenticated requests

The endpoints will respect these limits and return appropriate error messages if limits are exceeded.

## Usage Examples

### Fetch live pull requests from GitHub:
```bash
curl -X GET "http://localhost:3000/api/pullrequests/user/60f7b3b3b3b3b3b3b3b3b3b3/github?state=open&page=1&per_page=10"
```

### Sync pull requests to database:
```bash
curl -X POST "http://localhost:3000/api/pullrequests/user/60f7b3b3b3b3b3b3b3b3b3b3/sync"
```

### Get statistics:
```bash
curl -X GET "http://localhost:3000/api/pullrequests/user/60f7b3b3b3b3b3b3b3b3b3b3/stats"
```