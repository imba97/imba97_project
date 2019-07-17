<?php

class File {
  private $_tree;
  public $files = array();

  public function getTree() {
    return $this->_tree;
  }

  public function getFileTree($sourcePath) {
    if(empty($sourcePath)) {
      die('路径为空');
    }

    if(!is_array($this->_tree)) {
      $this->_tree = array();
    }

    $temp = scandir($sourcePath);

    $tree = array();

    foreach ($temp as $v) {
      $f = $sourcePath . '/' . $v;

      if($v != '.' && $v != '..') {
        if(is_dir($f)) {
          $tree[$v] = $this->getFileTree($f);
        } else {
          array_push($tree, $v);
          array_push($this->files, array('path' => $sourcePath, 'filename' => $v));
        }
      }

    }

    $this->_tree = $tree;

    return $tree;
  }

  public function cpFrom($copyPath) {

    require_once 'logger.php';
    $logger = new Logger();
    $logger->type('info')->write('开始复制文件');

    $temp = scandir($copyPath);

    foreach($temp as $v) {
      if($v != '.' && $v != '..') {
        $path = $copyPath.'/'.$v;
        $isFind = false;
        foreach ($this->files as $file) {
          if($v == $file['filename']) {
            $targetPath = $file['path'];
            $isFind = true;
            $filePath = $targetPath.'/'.$file['filename'];
            $res = copy($path, $filePath);
            if($res) {
              $status = '成功';
            } else {
              $status = '失败';
            }
          }
        }
        if($isFind) {
          $log = "找到 $v ，路径：“ $targetPath ”，替换 $status";
          if($status == '成功') {
            $logger->type('success')->write($log);
          } else {
            $logger->type('error')->write($log);
          }
        } else {
          $log = '未发现'.$v;
          $logger->type('notice')->write($log);
        }

        echo $log.'<br>';
      }
    }

    $logger->type('info')->write('复制文件结束');
  }
}
