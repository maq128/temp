# MySQL

[Starting MySQL as a Windows Service](https://dev.mysql.com/doc/refman/8.0/en/windows-start-service.html)

	mysqld.exe --install MySQL

	net start mysql
	net stop mysql

	mysqld.exe --remove

# Redis

[Running Redis on Windows](https://dzone.com/articles/running-redis-on-windows-81-and-prior)

	redis-server --service-install

	net start redis
	net stop redis

	redis-server --service-uninstall
