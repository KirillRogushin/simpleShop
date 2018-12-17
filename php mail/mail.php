<?php
$data = file_get_contents('php://input');
$data = json_decode($data, true);
// var_dump($data);
// Сообщение
 $message  = 'Name: '.$data['name']."\n";
 $message .= 'Phone: '.$data['phone']."\n";
 $message .='>>>>>>>>>>>>>'."\n";
//$key - id товара $value = ("name" => яблоки)
$summa = 0;
 foreach ($data['cart'] as $key => $value) {
    $message .='id: '.$key."\n";
    $message .='id: '.$value["name"]."\n";
    $message .=' count: '.$value["cost"]."\n";
    $message .=' count: '.$value["count"]."\n";
    $message .='------------------'."\n";
    $summa += $value['count']*$value['cost'];
 }
$message .= 'Summa: '.$summa;

// Отправляем
 $mail = mail($data['email'], 'GoogleShop', $message);
if ($mail){
    echo 'yes';
}
else {
    echo 'no';
}
?>