<?php
header('Expires: Sun, 01 Jan 2014 00:00:00 GMT');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', FALSE);
header('Pragma: no-cache');
header('Access-Control-Allow-Origin: *');
header('Content-Type: image/png'); 

echo file_get_contents('https://raw.githubusercontent.com/jeancaffou/Bot/master/design.png');
//echo file_get_contents('design.png');
