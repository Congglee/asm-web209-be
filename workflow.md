# Cấu trúc thư mục và quy trình làm việc với GIT

## Giải thích thư mục

1. controller: nơi chứa những file tương tác với database (CRUD, Filter, ...)
2. routes: nơi chứa những file định nghĩa route api
3. models: nơi chứa các collection (bảng) của database
4. schemas: nơi chứa file validate model fields
5. middlewares: nơi chứa file tạo access token, refresh token, authorization
6. config: nơi chứa file config cloudinary, db connect, ...
7. main.js: file server

## Quy trình làm việc với GIT trong nhóm

1. Khi muốn phát triền chức năng mới, tạo 1 nhánh feature/feature-name từ develop
   VD: Muốn phát triển chức năng login thì đứng ở nhánh feature ghi

```bash
git checkout -b feature/login
```

2. Làm việc, code trên nhánh khi làm xong thì git add ., khi commit thì phải ghi message commit như sau: git commit -m "feature: feature name"

VD: Khi phát triển chức năng login thì ghi commit như sau:

```bash
git commit -m "feature: login"
```

3. Commit thì push code lên nhánh đang làm việc của cá nhân: git push origin feature/feature-name

VD: Đẩy nhánh làm việc chứa chức năng login

```bash
git push origin feature/login
```

4. Tạo pull request, ghi tiêu đề chức năng mình đang phát triển, comment thì ghi chi tiết chức năng mình đã làm và assign cho mọi người để review và test code

5. Khi review và test chạy được ổn thì team lead sẽ merge vào nhánh develop

> Tương tự khi muốn sửa hay update chức năng thì đổi lại tên nhánh (hotfix/hotfix-name) và commit("hotfix: hotfix name")
