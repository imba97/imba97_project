# QQ头像统计
用PHP做的，统计指定QQ号换头像的次数。

# 使用方法

首先导入`profile.sql`数据表，配置一下`get_qq_profile.php`和`stat.php`中的连接数据库设置和QQ号

`get_qq_profile.php`是主程序，你可以制定定时任务每隔一段时间运行一次。linux的话用`crontab -e`，添加以下内容。

`*/10 * * * * /php/72/bin/php /home/name/get_qq_profile.php`

分别是时间（我设置的是每10分钟运行一次）、PHP绝对路径、程序绝对路径。

`stat.php`是统计信息页面。

![](../images/getQQProfile/stat.png)
