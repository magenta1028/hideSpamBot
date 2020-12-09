# hideSpamBot
카카오톡에서 홍보가 전송되었을때 가리는 봇.

# 개요
카카오톡에서 홍보가 오는 경우가 많습니다.   
이런경우는 대부분 텍스트로 뿌리고 다니는데 요즘은 봇까지 써서 홍보한다고 하더라구요..   
플러스친구만 사용이 가능하다고 아는 것을 사용해서 홍보를 감지하는 봇까지 우회해서 홍보를 하더라고요..   
이런것들을 막으려고 홍보를 감지하여 가리고 내보내는 봇을 오픈소스로 공개합니다.

# 사용법
1. Node Js 설치   
2. npm install node-kakao 입력   
3. 소스코드 빈칸에 알맞는 것 입력   
4. 봇 실행   
5. banWord에 감지할 메세지 추가 (선택)

# DEVICE UUID 얻는법
1. HxD 설치 (https://mh-nexus.de/en/hxd/)   
2. 봇 계정으로 PC에서 카카오톡 로그인   
3. 작업관리자 실행 후 카카오톡 우클릭 - 덤프 파일 만들기 클릭   
4. HxD에서 덤프 파일 오픈   
5. device_uuid= 검색   
6. device_uuid= 부터 %3D%3D 까지 복사   
7. URI DECODE (https://www.urldecoder.org/)   

# 사용한 라이브러리
node-kakao (https://github.com/storycraft/node-kakao)
