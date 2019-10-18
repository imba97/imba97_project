<?php
header("Content-type:text/html;charset=utf-8");
?>

<!DOCTYPE html>
<html lang="cn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>统计页面</title>
  <style>
    body,div,p,ul,li { margin: 0; padding: 0; }
    li{ list-style-type: none; }

    .profile-list li {
      float: left;
      padding: 10px;
    }

    .profile-list:after {
      content: '';
      display: block;
      clear: both;
    }

    .profile-list li p {
      font-size: 14px;
    }

    .current {
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 12px;
      background-color: #FF0;
      opacity: 0.75;
    }
  </style>
</head>
<body>
<?php

$con=mysqli_connect("localhost","root","root","database");

if (mysqli_connect_errno($con))
{
    echo "连接 MySQL 失败: " . mysqli_connect_error();
}

// 执行查询

$oldImageResult = mysqli_query($con,"SELECT * FROM profile order by updated_at desc");

if($oldImageResult->num_rows === 0) {
	die('暂无数据');
}

$arr = array();

while($res = mysqli_fetch_assoc($oldImageResult)) {
	$arr[] = $res;
}

$start_time = 0;
$recent_time = 0;
$count = 0;

echo '<ul class="profile-list">';
if(count($arr) !== 0) {
	foreach($arr as $key => $val) {
      	if($start_time === 0 || strtotime($val['updated_at']) < strtotime($start_time)) $start_time = $val['updated_at'];
      	if($recent_time === 0 || strtotime($val['updated_at']) >= strtotime($recent_time)) $recent_time = $val['updated_at'];
      	$count += intval($val['sy']);
      	$current = $key === 0 ? '(当前使用)' : '';
    	echo '<li><img src="'.$val['base64'].'" width="100" height="100"> <p>累计使用：'.$val['sy'].'次</p><span class="current">'.$current.'</span></li>';
    }

  	echo '</ul>';
}

?>

<div style="position: fixed; bottom: 0; left: 0;">
  <p style="color: #666; font-size: 12px;"><?php echo '自'.$start_time.'起，累计更换头像 <span style="color:#F66">'.$count.'</span> 次'; ?></p>
  <p style="color: #666; font-size: 12px;"><?php echo '最近一次更换是'.$recent_time.'(±10分钟)'; ?></p>

<p style="color: #666; font-size: 12px; margin-top: 10px;">工作原理：每10分钟执行一次，通过QQ号获取头像文件，把图片的md5、base64资源存入数据库</p>
<p style="color: #666; font-size: 12px;">如果原来有这条数据，并且不是当前在用，则判断为更换头像，让相应的头像使用次数+1</p>
<p style="color: #666; font-size: 12px;">如果没有则加入一条数据，并设置为正在使用</p>
</div>



</body>
</html>
