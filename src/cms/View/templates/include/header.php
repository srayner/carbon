<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title><?php echo htmlspecialchars($results['pageTitle'])?></title>
        <link rel="icon" href="images/logo_16.png">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        <div class="header container-fluid">
            <a class="logo" href="."><img id="logo" src="images/logo_96.png" alt="Logo" />Carbon CMS</a>
            
            <?php if (isset($_SESSION['username'])): ?>
            <span class="pull-right">You are logged in as <b><?php echo htmlspecialchars( $_SESSION['username']) ?></b>. <a href="/logout">Log out</a></span>
            <?php endif; ?>
            
        </div>
        <div class="container">    


