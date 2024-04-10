<?php

header('Access-Control-Allow-Origin: https://imba97.cn');
header('content-type:application/json;charset=utf-8');

// 因为之前的方法不能用了，所以直接返回
die(json_encode(['code'=>0,'msg'=>'程序挂了']));

function GetVideos($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25"]);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    $output = curl_exec($ch);
    curl_close($ch);
    return $output;
}

function GetUrl($url)
{
    $UserAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HEADER, 0);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_ENCODING, '');
    curl_setopt($curl, CURLOPT_USERAGENT, $UserAgent);
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
    $data = curl_exec($curl);
    curl_close($curl);
    return $data;
}
//URL
$url = trim($_GET['url']);
$code = $_GET['code'];

if ($code != '977') die(json_encode(['code' => 0, 'msg' => '专属邀请码错误']));

if (empty($url)) die(json_encode(['code' => 0, 'msg' => '分享地址格式不能为空']));

if (!preg_match('/https?:\/\/v\.douyin\.com\/[a-zA-Z0-9]+/', $url)) die(json_encode(['code' => 0, 'msg' => '分享地址格式不正确']));

$data = GetUrl($url);
//获取
preg_match('/"https?:\/\/aweme\.snssdk\.com\/(.*)"/i', $data, $url);
preg_match('/<p class="desc">(?<desc>[^<>]*)<\/p>/i', $data, $nameArray);
$name = $nameArray['desc'];
$url = $url['url'];
if(empty($url))
{
    echo json_encode(['code' => 0, 'msg' => '解析错误']);
    exit;
}

preg_match('/s_vid=(.*?)&/', $url, $id);
$url = 'https://aweme.snssdk.com/aweme/v1/play/?s_vid=' . $id[1] . '&line=0';
$data_new = GetVideos($url);
preg_match('/<source src=\"https?:\/\/(.*?)\">/', $data_new, $link);

if (empty($link[1])) {
    echo json_encode(['code' => 0, 'msg' => '解析错误']);
    exit;
}

$link = 'http://' . $link[1];
echo json_encode(['code' => 1, 'name' => $name, 'url' => $link]);
