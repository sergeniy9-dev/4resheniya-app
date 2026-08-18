<?php
$allowedSources = [
    'jk_leaflet' => 'jk_leaflet',
    'jk_booklet' => 'jk_booklet',
    'flyer_qr' => 'flyer_qr',
    'booklet_qr' => 'booklet_qr',
    'business_card_qr' => 'business_card_qr',
];

$src = $_GET['src'] ?? 'qr_unknown';
$src = preg_replace('/[^a-zA-Z0-9_\-]/', '', $src);

if (!isset($allowedSources[$src])) {
    $src = 'qr_unknown';
}

$botUsername = 'id9725006609_bot';
$maxUrl = 'https://max.ru/' . $botUsername . '?start=' . urlencode($src);
$metrikaId = 109267393;
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Открываем MAX — 4 Решения</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="3;url=<?= htmlspecialchars($maxUrl, ENT_QUOTES, 'UTF-8') ?>">

  <script type="text/javascript">
    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],
      k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    ym(<?= (int)$metrikaId ?>, "init", {
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true,
      webvisor:true
    });

    function openMax() {
      var url = <?= json_encode($maxUrl, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>;

      try {
        ym(<?= (int)$metrikaId ?>, "reachGoal", "qr_max_open", {
          source: <?= json_encode($src, JSON_UNESCAPED_UNICODE) ?>,
          channel: "max",
          type: "qr"
        }, function () {
          window.location.href = url;
        });

        setTimeout(function () {
          window.location.href = url;
        }, 900);
      } catch (e) {
        window.location.href = url;
      }
    }

    window.addEventListener("load", openMax);
  </script>

  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #080806;
      color: #ead7a3;
      font-family: Arial, sans-serif;
      text-align: center;
    }

    .box {
      padding: 32px;
      max-width: 420px;
    }

    h1 {
      font-size: 28px;
      margin-bottom: 12px;
    }

    p {
      color: #f4ead0;
      line-height: 1.5;
    }

    a {
      display: inline-block;
      margin-top: 20px;
      padding: 14px 24px;
      border-radius: 999px;
      background: #d7ad58;
      color: #080806;
      text-decoration: none;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <noscript>
    <img src="https://mc.yandex.ru/watch/<?= (int)$metrikaId ?>" style="position:absolute; left:-9999px;" alt="">
  </noscript>

  <div class="box">
    <h1>Открываем MAX</h1>
    <p>Сейчас откроется чат с компанией «4 Решения».</p>
    <a href="<?= htmlspecialchars($maxUrl, ENT_QUOTES, 'UTF-8') ?>">Открыть MAX</a>
  </div>
</body>
</html>