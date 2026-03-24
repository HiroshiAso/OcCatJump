<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Tiles</title>
    <link rel="stylesheet" href="coca-cola-tiles.css">
</head>
<body>
    <div class="container">
        <h1>AsoCola</h1>
        <div class="tile-grid">
            <?php for ($i = 1; $i <= 40; $i++): ?>
                <?php $num = sprintf('%02d', $i); ?>
                <a href="/OcImageShare/<?= $num ?>/" class="tile"><?= $num ?></a>
            <?php endfor; ?>
        </div>
    </div>
</body>
</html>
