<?php
$hosts = ['127.0.0.1', 'localhost'];
$passwords = ['', 'root', 'admin', '1234'];

foreach ($hosts as $host) {
    foreach ($passwords as $pass) {
        try {
            $pdo = new PDO("mysql:host={$host};port=3306", 'root', $pass);
            echo "Conexion OK - host={$host} password='{$pass}'" . PHP_EOL;
            $pdo->exec("CREATE DATABASE IF NOT EXISTS eva_cafeteria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            echo "DB eva_cafeteria creada!" . PHP_EOL;
            exit(0);
        } catch(Exception $e) {
            echo "Fallo host={$host} pass='{$pass}': " . $e->getMessage() . PHP_EOL;
        }
    }
}
