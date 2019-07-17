<?php
class Logger {
  private $_type = 'info';
  private $_path = './';
  private $_filename = 'log.txt';

  function __construct() {
    date_default_timezone_set('PRC');
  }

  public function type($type) {
    $this->_type = $type;
    return $this;
  }

  public function write($msg) {
    $prefix = '[' . $this->_type . ']';

    $log = $prefix."\t".date('[Y-m-d H:i:s]', time())."\t".$msg;

    $file = $this->_path.$this->_filename;

    if(!file_exists($file)) {
      $f = fopen($this->_filename, "w");
      fclose($f);
    }
    $fileArr = file($file);

    array_push($fileArr, $log);

    foreach($fileArr as $k => $v) {
      if($v == "\r\n") {
        unset($fileArr[$k]);
      }
      $fileArr[$k] = str_replace("\r\n", '', $v);
    }

    $f = fopen($file, "w+");
    fwrite($f, implode("\r\n", $fileArr));

    fclose($f);
  }
}
