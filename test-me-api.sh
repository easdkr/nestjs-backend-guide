#!/bin/bash

# 서버 URL 설정 (필요시 변경)
BASE_URL="http://localhost:3000"

echo "=== 1. 회원가입 (또는 기존 계정 사용) ==="
SIGNUP_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "nickname": "testuser",
    "birthDate": "1990-01-01",
    "gender": "MALE",
    "termsAgreed": true,
    "marketingAgreed": false
  }')

echo "$SIGNUP_RESPONSE" | jq '.'

# accessToken 추출
ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.accessToken // empty')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo ""
  echo "=== 2. 로그인 (회원가입 실패 시 또는 기존 계정 사용) ==="
  LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "Test1234!"
    }')
  
  echo "$LOGIN_RESPONSE" | jq '.'
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
fi

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo "❌ 토큰을 받을 수 없습니다. 이메일이 이미 존재하는 경우 로그인을 사용하세요."
  exit 1
fi

echo ""
echo "=== 3. Me API 호출 ==="
curl -X GET "${BASE_URL}/user/me" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" | jq '.'

