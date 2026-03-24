<?php
header('Content-Type: application/json');

function buildTree($dir, $basePath = 'src') {
    $result = [];
    if (!is_dir($dir)) return $result;
    $scanned = array_diff(scandir($dir), ['..', '.']);
    
    // Folders first, then files
    $folders = [];
    $files = [];
    
    foreach($scanned as $f) {
        $fullPath = $dir . '/' . $f;
        $relPath = $basePath . '/' . $f;
        if(is_dir($fullPath)) {
            $folders[] = [
                'type' => 'folder',
                'name' => $f,
                'path' => $relPath,
                'children' => buildTree($fullPath, $relPath)
            ];
        } else {
            $files[] = [
                'type' => 'file',
                'name' => $f,
                'path' => $relPath
            ];
        }
    }
    
    // Sort alphabetically
    usort($folders, function($a, $b) { return strcmp($a['name'], $b['name']); });
    usort($files, function($a, $b) { return strcmp($a['name'], $b['name']); });
    
    return array_merge($folders, $files);
}

$target = isset($_GET['target']) ? $_GET['target'] : 'src';
// Simple safety check to ensure target is like 'src', 'src01', 'src02', etc.
if (!preg_match('/^src(\d{2})?$/', $target)) {
    $target = 'src';
}

$targetDir = __DIR__ . '/' . $target;
$tree = [
    [
        'type' => 'folder',
        'name' => $target,
        'path' => $target,
        'children' => buildTree($targetDir, $target)
    ]
];

echo json_encode($tree);
