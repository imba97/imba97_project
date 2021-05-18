<?php

// 把xxxxxxxxxx换成你要统计的QQ号

$imageUrl = 'http://q1.qlogo.cn/g?b=qq&nk=xxxxxxxxxx&s=100';
$imageData = file_get_contents($imageUrl);

$md5 = md5($imageData);

// 假定数据库用户名：root，密码：123456，数据库：RUNOOB
$con=mysqli_connect("localhost","root","root","database");

if (mysqli_connect_errno($con))
{
    echo "连接 MySQL 失败: " . mysqli_connect_error();
}

// 执行查询
$oldImageResult = mysqli_query($con,"SELECT * FROM profile where md5 = '$md5'");

$oldImageInfo = mysqli_fetch_assoc($oldImageResult);

$currentTime = date('Y-m-d H:i:s', time());

if($oldImageInfo) {
	if($oldImageInfo['isnew'] != 1) {
      	mysqli_query($con, "UPDATE profile SET isnew = 0 where isnew = 1");
		mysqli_query($con, "UPDATE profile SET isnew = 1, sy = sy + 1, updated_at = '$currentTime' where md5 = '$md5'");
	}
} else {
	$base64 = imgtobase64($imageData);
    // 如果不是垃圾数据 base64大于50 说明正常
    var_dump(strlen($base64));
    if(strlen($base64) > 5000) {
      mysqli_query($con, "UPDATE profile SET isnew = 0 where isnew = 1");
      mysqli_query($con, "INSERT INTO profile (md5, base64, isnew, created_at, updated_at) VALUES ('$md5', '$base64', 1, '$currentTime', '$currentTime')");
    }
}

// mysqli_query($con,"INSERT INTO websites (name, url, alexa, country) VALUES ('百度','https://www.baidu.com/','4','CN')");

mysqli_close($con);

function imgtobase64($imgData, $imgHtmlCode=true)
{
  $base64 = "" . chunk_split(base64_encode($imgData));
  return 'data:image/jpeg;base64,' . chunk_split(base64_encode($imgData));
}

?>
