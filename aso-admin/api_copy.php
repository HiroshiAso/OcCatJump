<?php
header('Content-Type: application/json');

// コピー元のディレクトリ
$source = __DIR__ . '/../src';

// コピー先のディレクトリ配列（src01 〜 src40）
$targets = [];
for ($i = 1; $i <= 40; $i++) {
    $targets[] = __DIR__ . '/../src' . str_pad($i, 2, '0', STR_PAD_LEFT);
}

/**
 * ディレクトリ内のすべてのファイルとフォルダを削除する関数
 */
function deleteDirContents($dir) {
    if (!is_dir($dir)) {
        return;
    }
    $items = scandir($dir);
    foreach ($items as $item) {
        if ($item == '.' || $item == '..') {
            continue;
        }
        $path = $dir . '/' . $item;
        if (is_dir($path)) {
            deleteDirContents($path);
            rmdir($path);
        } else {
            unlink($path);
        }
    }
}

/**
 * ディレクトリごと再帰的にコピーする関数（既存ファイルは上書き）
 */
function copyDir($src, $dst) {
    if (!is_dir($src)) {
        return false;
    }

    // コピー先ディレクトリが存在しない場合は作成
    if (!is_dir($dst)) {
        mkdir($dst, 0777, true);
    }

    $dir = opendir($src);
    while (false !== ($file = readdir($dir))) {
        if ($file != '.' && $file != '..') {
            $srcFile = $src . '/' . $file;
            $dstFile = $dst . '/' . $file;
            
            if (is_dir($srcFile)) {
                // サブディレクトリの場合は再帰呼び出し
                copyDir($srcFile, $dstFile);
            } else {
                // ファイルの場合はコピー（同名ファイルが存在すれば上書きされます）
                copy($srcFile, $dstFile);
            }
        }
    }
    closedir($dir);
    return true;
}

$success = true;

// 実行
foreach ($targets as $target) {
    // コピー前にフォルダ内を空にする
    deleteDirContents($target);
    
    if (!copyDir($source, $target)) {
        $success = false;
        break;
    }
}

if ($success) {
    echo json_encode(['status' => 'success', 'message' => 'Copy completed!']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to copy some directories.']);
}
