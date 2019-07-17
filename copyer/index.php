<?php
require_once './file.php';
$file = new File();

$file->getFileTree('a');
$file->cpFrom('t');
?>
