<?php header("Content-Type:text/html;charset=utf-8"); ?>
<?php //error_reporting(E_ALL | E_STRICT);
mb_language("japanese");
mb_internal_encoding("utf-8");

// Start - SMTP送信化 ON/OFF
require 'smtp/PHPMailer.php';
require 'smtp/SMTP.php';
require 'smtp/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
// End - SMTP送信化 ON/OFF

if (version_compare(PHP_VERSION, '5.1.0', '>=')) {
	date_default_timezone_set('Asia/Tokyo');
}

//---------------------------　必須設定　-----------------------
// サイトトップURL
$site_top = "https://yamiyami3141.github.io/index.html";

// 管理者メールアドレス
$to = "kotori.lab.com@gmail.com";

// 送信元メールアドレス
$from = "kotori.lab.com@gmail.com";

// メールアドレスname属性値
$Email = "Email";
//---------------------------　必須設定　------------------------------------


//---------------------------　セキュリティ、スパム防止のための設定　------------------------------------
// リファラチェック (する=1, しない=0)
$Referer_check = 0;

// リファラチェックを「する」場合のドメイン
$Referer_check_domain = "xxxxx.com";

// セッションによるワンタイムトークン（CSRF対策、及びスパム防止）(する=1, しない=0)
$useToken = 1;
//---------------------------　セキュリティ、スパム防止のための設定　ここまで　------------------------------------


//---------------------- 任意設定　以下は必要に応じて設定してください ------------------------
// Bccメールアドレス
$BccMail = "reiya3141@gmail.com";

// 管理者メールのタイトル
$subject = "【小鳥Lab】お問い合わせがありました";

// 送信確認画面の表示 (する=1, しない=0)
$confirmDsp = 1;

// 送信完了ページの指定 (する=1, しない=0)
$jumpPage = 1;

// 送信完了後ページ
$thanksPage = "/forms/thanks.html";

// 必須入力項目を設定する (する=1, しない=0)
$requireCheck = 1;

// 必須入力項目
$require = array('お名前', 'Email','個人情報保護方針に同意する');


//----------------------------------------------------------------------
//  自動返信メール設定(START)
//----------------------------------------------------------------------
// 自動返信メールを送る (送る=1, 送らない=0)
$remail = 0;

// 自動返信メールの送信者
$refrom_name = "小鳥Lab";

// 差出人に送信確認メールを送る場合のメールのタイトル（上記で1を設定した場合のみ）
$re_subject = "送信ありがとうございました";

// フォーム側の「名前」箇所のname属性値
$dsp_name = 'お名前';

// 自動返信メール本文
$remail_text = <<< TEXT

お問い合わせありがとうございました。
早急にご返信致しますので今しばらくお待ちください。

送信内容は以下になります。

TEXT;

// 自動返信メールに署名を表示 (する=1, しない=0)
$mailFooterDsp = 1;

// 上記で「1」を選択時に表示する署名
$mailSignature = <<< FOOTER

＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
署名。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

FOOTER;
//----------------------------------------------------------------------
//  自動返信メール設定(END)
//----------------------------------------------------------------------

// メールアドレスの形式チェック (する=1, しない=0)
$mail_check = 1;

// 全角英数字→半角変換を行うかどうか (する=1, しない=0)
$hankaku = 0;

// 全角英数字→半角変換を行う項目のname属性値
$hankaku_array = array('電話番号', '金額');

// -fオプションによるエンベロープFrom（Return-Path）の設定(する=1, しない=0)　
$use_envelope = 0;

// 機種依存文字の変換
// 変換前の文字
$replaceStr['before'] = array('①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '№', '㈲', '㈱', '髙');
// 変換後の文字
$replaceStr['after'] = array('(1)', '(2)', '(3)', '(4)', '(5)', '(6)', '(7)', '(8)', '(9)', '(10)', 'No.', '（有）', '（株）', '高');

//----------------------------------------------------------------------
// CSV保存用設定 （START）
//----------------------------------------------------------------------
// CSVに保存する (する=1, しない=0)
$csv_backup = 0;

// CSV保存先ディレクトリ
$csv_dir = "data/";

// CSV保存ファイル名
$csv_filename = "data.csv";

// CSVファイルパス（変更禁止）
$csv_file_path = $csv_dir . $csv_filename;

// 各データの先頭に「0」が含まれていたら「"」の前に「=」を追記する (する=1, しない=0) 
$csv_data_esc = 1;

// CSVに保存する項目を指定する（保存項目のname属性値を指定）※空（指定しない）の場合、全送信項目を保存
$regData = array();

// CSVダウンロードに認証を利用する (する=1, しない=0) 
$session_auth = 0;

// 上記で認証を利用する場合の認証用ID、パスワード
$userid   = 'admin';
$password = '26%e7s5fcW5r2aC';
//----------------------------------------------------------------------
// CSV保存用設定 （END）
//----------------------------------------------------------------------

//----------------------------------------------------------------------
// スパムチェック用設定 （START）
//----------------------------------------------------------------------
// スパムチェックを行うかどうか (行う=1, 行わない=0)
$spamCheck = 0;

// 禁止IPアドレス
$ng_ip = array('000.000.00.1', '000.000.00.2');

// IPアドレス確認
//echo $_SERVER["REMOTE_ADDR"];

// 禁止ワード
$ng_word = array('NGワード', 'http://xxxxx.com/', 'おまえ');

// 禁止ワード検証を行うコメント欄（textarea）のname属性値
$ng_word_name = "お問い合わせ内容";

// ローマ字の大文字、小文字を同一のものと判断する (する=1, しない=0)
$stri_check = 0;
//----------------------------------------------------------------------
// スパムチェック用設定 （END）
//----------------------------------------------------------------------

//----------------------------------------------------------------------
// メールアドレス2重チェック用設定 （START）
//----------------------------------------------------------------------
// メールアドレス2重チェック (する=1, しない=0)
$mail_2check = 0;

// 確認メールアドレス入力箇所のname属性の値（2重チェックに使用）
$ConfirmEmail = "Email（確認）";
//----------------------------------------------------------------------
// メールアドレス2重チェック用設定 （END）
//----------------------------------------------------------------------

//----------------------------------------------------------------------
//  添付ファイル処理用設定(BEGIN)
//----------------------------------------------------------------------
// 添付ファイルのMAXファイルサイズ
$maxImgSize = 5024000;

// 添付ファイル一時保存用ディレクトリ
$tmp_dir_name = './tmp/';

// 添付許可ファイル（拡張子）
$permission_file = array('jpg', 'jpeg', 'gif', 'png', 'pdf', 'txt', 'xls', 'xlsx', 'zip', 'lzh', 'doc');

// フォームのファイル添付箇所のname属性の値
$upfile_key = 'upfile';

// サーバー上の一時ファイルを削除する (する=1, しない=0)
$tempFileDel = 1;
$rename = 0;

// サーバーのphp.iniの「mail.add_x_header」がONかOFFかチェックを行う (する=1, しない=0)
$iniAddX = 0;

//添付ファイル名をCSVファイルにも記述する（↑のCSV保存機能がONの場合のみ有効）(する=1, しない=0)　
$attach2Csv = 0;
//----------------------------------------------------------------------
//  添付ファイル処理用設定(END)
//----------------------------------------------------------------------

//----------------------------------------------------------------------
//  メールアドレス振り分け用設定(START)
//----------------------------------------------------------------------
// 振り分けを実施する項目のname属性値
$setName = "";

// お問い合わせ先とメールアドレスのセット
$name_address_array = array(
	"A店舗" => "aaaa@xxx.com",
	"B店舗" => "bbbb@xxx.com",
	"C店舗" => "cccc@xxx.com",
);

// BCC振り分け送信先設定
$name_bcc_address_array = array(
	"A店舗" => "bcc_aaaa@xxx.com",
	"B店舗" => "bcc_bbbb@xxx.com",
	"C店舗" => "bcc_cccc@xxx.com",
);
//----------------------------------------------------------------------
//  メールアドレス振り分け用設定(END)
//----------------------------------------------------------------------

//----------------------------------------------------------------------
//  Google reCAPTCHA設定(START)
//----------------------------------------------------------------------
// Google reCAPTCHAによる認証を行うかどうか(する=1, しない=0)
$recaptcha['conf'] = 0;

// シークレットキー（Secret key）
$recaptcha['secretkey'] = 'ここにSecret keyを設定下さい';

// サイトキー（sitekey）
$recaptcha['sitekey'] = 'ここにsitekeyを設定下さい';
//----------------------------------------------------------------------
//  Google reCAPTCHA設定(END)
//----------------------------------------------------------------------

//----------------------------------------------------------------------
// カスタマイズ版独自設定 （START）
//----------------------------------------------------------------------
// カウントを行ってメール内に表示する (する=1, しない=0)
$addCount = 0;

// 連番のタイトル
$countTitle = 'お問い合わせ番号';

// 0埋めの桁数
$keta = 5;

// 連番の先頭に付ける接頭辞
$countPrefix = '';

// カウント用ファイルパス
$countFilePath = 'data/count.dat';
//----------------------------------------------------------------------
//  SMTP送信用設定(START)
//----------------------------------------------------------------------
// SMTPでの送信を行うかどうか (する=1, しない=0)
$smpton = 0;

// SMTP送信用設定
$smtp_config = array(
	'host' => 'xxx.xxxxxxx.xx',
	'user' => 'xxx@xxx.xxx',
	'pass' => 'xxxxxxxxx',

	'from' => $from,
	'protocol' => 'SMTP_AUTH',
	'port' => 587,
);
//----------------------------------------------------------------------
//  SMTP送信用設定(END)
//----------------------------------------------------------------------

//------------------------------- 任意設定ここまで ---------------------------------------------

//----------------------------------------------------------------------
//  関数実行、変数初期化
//----------------------------------------------------------------------
//トークンチェック用のセッションスタート
if ($useToken == 1 && $confirmDsp == 1) {
	session_name('PHPMAILFORMSYSTEM');
	session_start();
}
$encode = "UTF-8"; //このファイルの文字コード定義（変更不可）
//選択項目によるメールアドレスのセット
if (isset($_POST[$setName]) && array_key_exists($_POST[$setName], $name_address_array)) {
	$to = $name_address_array[$_POST[$setName]];
	$BccMail = (isset($name_bcc_address_array[$_POST[$setName]])) ? $name_bcc_address_array[$_POST[$setName]] : $BccMail;
}

if (isset($_GET)) $_GET = sanitize($_GET); //NULLバイト除去//
if (isset($_POST)) $_POST = sanitize($_POST); //NULLバイト除去//
if (isset($_COOKIE)) $_COOKIE = sanitize($_COOKIE); //NULLバイト除去//
//----------------------------------------------------------------------
//  CSVダウンロード認証とダイアログ表示(START)
//----------------------------------------------------------------------
if (!empty($_GET['mode']) && $_GET['mode'] == 'download' && $session_auth == 0) {
	exit();
}
if (!empty($_GET['mode']) && $_GET['mode'] == 'download' && $session_auth == 1) {
	csvDialog($csv_file_path, $userid, $password);
}
//----------------------------------------------------------------------
//  CSVダウンロード認証とダイアログ表示(END)
//----------------------------------------------------------------------
if ($encode == 'SJIS') $_POST = sjisReplace($_POST, $encode); //Shift-JISの場合に誤変換文字の置換実行
$funcRefererCheck = refererCheck($Referer_check, $Referer_check_domain); //リファラチェック実行

//変数初期化
$sendmail = 0;
$empty_flag = 0;
$post_mail = '';
$errm = '';
$header = '';

//----------------------------------------------------------------------
//  CSV保存ディレクトリパーミッションチェック(BEGIN)
//----------------------------------------------------------------------
if ($csv_backup == 1 && (!file_exists($csv_dir) || !is_writable($csv_dir))) {
	exit('（重大なエラー）CSV保存用のディレクトリが無いかパーミッションが正しくありません。$csv_dirで指定してるディレクトリが存在するか、または$csv_dirで指定してるディレクトリのパーミッションを書き込み可能（777等※サーバによる）にしてください');
}
//----------------------------------------------------------------------
//  CSV保存ディレクトリパーミッションチェック(END)
//----------------------------------------------------------------------

//----------------------------------------------------------------------
//  添付ファイル処理(BEGIN)
//----------------------------------------------------------------------
if (isset($_FILES[$upfile_key])) {
	$file_count = count($_FILES[$upfile_key]["tmp_name"]);
	for ($i = 0; $i < $file_count; $i++) {

		if (@is_uploaded_file($_FILES[$upfile_key]["tmp_name"][$i])) {
			if ($_FILES[$upfile_key]["size"][$i] < $maxImgSize) {

				//許可拡張子チェック
				$upfile_name_check = '';
				$upfile_name_array[$i] = explode('.', $_FILES[$upfile_key]['name'][$i]);
				$upfile_name_array_extension[$i] = strtolower(end($upfile_name_array[$i]));
				foreach ($permission_file as $permission_val) {
					if ($upfile_name_array_extension[$i] == $permission_val) {
						$upfile_name_check = 'checkOK';
					}
				}
				if ($upfile_name_check != 'checkOK') {
					$errm .= "<p class=\"error_messe\">「" . $_FILES[$upfile_key]['name'][$i] . "」は許可されていない拡張子です。</p>\n";
					$empty_flag = 1;
				} else {

					$temp_file_name[$i] = $_FILES[$upfile_key]["name"][$i];
					$temp_file_name_array[$i] =  explode('.', $temp_file_name[$i]);

					if (count($temp_file_name_array[$i]) < 2) {
						$errm .= "<p class=\"error_messe\">ファイルに拡張子がありません。</p>\n";
						$empty_flag = 1;
					} else {
						$extension = end($temp_file_name_array[$i]);

						if (function_exists('uniqid')) {
							if (!file_exists($tmp_dir_name) || !is_writable($tmp_dir_name)) {
								exit("（重大なエラー）添付ファイル一時保存用のディレクトリが無いかパーミッションが正しくありません。{$tmp_dir_name}ディレクトリが存在するか、または{$tmp_dir_name}ディレクトリのパーミッションを書き込み可能（777等※サーバによる）にしてください");
							}
							$upFileName[$i] = uniqid('temp_file_') . mt_rand(10000, 99999) . '.' . $extension;
							$upFilePath[$i] = $tmp_dir_name . $upFileName[$i];
						} else {
							exit('（重大なエラー）添付ﾌｧｲﾙ一時ﾌｧｲﾙ用のﾕﾆｰｸIDを生成するuniqid関数が存在しません。<br>PHPのﾊﾞｰｼﾞｮﾝが極端に低い（PHP4未満）ようです。<br>PHPをﾊﾞｰｼﾞｮﾝｱｯﾌﾟするか配布元に相談ください');
						}
						move_uploaded_file($_FILES[$upfile_key]['tmp_name'][$i], $upFilePath[$i]);
						@chmod($upFilePath[$i], 0666);

						//確認画面なしの場合はこの時点で添付ファイル情報をPOSTにセットする
						if ($confirmDsp == 0) {
							$_POST['upfilePath'][] = h($upFilePath[$i]);
							$_POST['upfileType'][] = h($_FILES[$upfile_key]['type'][$i]);
							$_POST['upfileOriginName'][] = h($_FILES[$upfile_key]['name'][$i]);
						}
					}
				}
			} else {
				$errm .= "<p class=\"error_messe\">「" . $_FILES[$upfile_key]['name'][$i] . "」はファイルサイズが大きすぎます。</p>\n";
				$empty_flag = 1;
			}
		}
	}
}
//----------------------------------------------------------------------
//  添付ファイル処理(END)
//----------------------------------------------------------------------

// 禁止IP,スパムチェック
if ($spamCheck == 1) {
	$spamCheckRes = spamCheck($ng_ip, $ng_word_name, $ng_word, $stri_check);
	$errm .= $spamCheckRes['errm'];
	if ($spamCheckRes['empty_flag'] == 1) $empty_flag = $spamCheckRes['empty_flag'];
}
if ($requireCheck == 1) {
	$requireResArray = requireCheck($require); //必須チェック実行し返り値を受け取る
	$errm .= $requireResArray['errm'];
	if ($requireResArray['empty_flag'] == 1) $empty_flag = $requireResArray['empty_flag'];
}
//メールアドレスチェック
if (empty($errm)) {
	foreach ($_POST as $key => $val) {
		if ($val == "confirm_submit") $sendmail = 1;
		if ($key == $Email) $post_mail = h($val);
		if ($key == $Email && $mail_check == 1 && !empty($val)) {
			if (!checkMail($val)) {
				$errm .= "<p class=\"error_messe\">【" . $key . "】はメールアドレスの形式が正しくありません。</p>\n";
				$empty_flag = 1;
			}
		}
		//メール2重チェック用確認メールアドレス取得
		if ($key == $ConfirmEmail) {
			$post_mail2 = h($val);
		}
	}
	//----------------------------------------------------------------------
	//  メール2重チェック(BEGIN)
	//----------------------------------------------------------------------
	if (!empty($post_mail) && !empty($post_mail2) && $post_mail != $post_mail2 && $mail_2check == 1) {
		$errm .= "<p class=\"error_messe\">確認メールアドレスが一致しません。</p>\n";
		$empty_flag = 1;
	}
	//----------------------------------------------------------------------
	//  メール2重チェック(BEGIN)
	//----------------------------------------------------------------------
}

if (($confirmDsp == 0 || $sendmail == 1) && $empty_flag != 1) {

	//reCAPTCHAの認証をチェックする（エラーなら強制終了）
	if ($recaptcha['conf'] == 1) { //reCAPTCHA機能がONの場合のみ実施する
		getRecaptchaRes($recaptcha['secretkey']);
	}

	//トークンチェック（CSRF対策）※確認画面がONの場合のみ実施
	if ($useToken == 1 && $confirmDsp == 1) {
		if (empty($_SESSION['mailform_token']) || ($_SESSION['mailform_token'] !== $_POST['mailform_token'])) {
			exit('ページ遷移が不正です');
		}
		if (isset($_SESSION['mailform_token'])) unset($_SESSION['mailform_token']); //トークン破棄
		if (isset($_POST['mailform_token'])) unset($_POST['mailform_token']); //トークン破棄
	}

	//----------------------------------------------------------------------
	//  連番付与処理(START)
	//----------------------------------------------------------------------
	if ($addCount == 1) {
		$get_count_num = get_count_num($countFilePath, $countPrefix, $addCount, $keta);
		$_POST =  array_merge(array($countTitle => $get_count_num), $_POST); //本文内に表示する場合はこちらを有効化すればOKです
		//$subject = str_replace('{number}',$get_count_num,$subject);//件名に連番を表示する場合（件名内の{number}の文字列を連番に置換します）
		//$re_subject = str_replace('{number}',$get_count_num,$re_subject);//自動返信メールの件名に連番を表示する場合（件名内の{number}の文字列を連番に置換します）
	}
	//----------------------------------------------------------------------
	//  連番付与処理(END)
	//----------------------------------------------------------------------

	//差出人に届くメールをセット
	if ($remail == 1) {
		$userBody = mailToUser($_POST, $dsp_name, $remail_text, $mailFooterDsp, $mailSignature, $encode);

		if ($smpton != 1) {
			$reheader = userHeader($refrom_name, $from, $encode);
			$re_subject = "=?iso-2022-jp?B?" . base64_encode(mb_convert_encoding($re_subject, "JIS", $encode)) . "?=";
		}
	}
	//管理者宛に届くメールをセット
	$adminBody = mailToAdmin($_POST, $subject, $mailFooterDsp, $mailSignature, $encode, $confirmDsp);

	if ($smpton != 1) {
		$header = adminHeader($post_mail, $BccMail);
	}

	//トラバーサルチェック
	if (isset($_POST['upfilePath'])) {
		traversalCheck($tmp_dir_name);
	}

	if ($smpton == 1) {
		//----------------------------------------------------------------------
		//  SMTP送信処理（2022/1/14動作確認済）
		//----------------------------------------------------------------------

		$fromname = $refrom_name;

		//管理者宛メール
		$mail = new PHPMailer();
		$mail->IsSMTP(); //稀にサーバーによってはこれがあることで動作しないことがあるので、その場合、コメントアウトで無効化してみて下さい。
		$mail->SMTPDebug = 0; // debugging: 1 = errors and messages, 2 = messages only
		$mail->SMTPAuth = true; //稀にサーバーによってはこれがあることで動作しないことがあるので、その場合、コメントアウトで無効化してみて下さい。（デフォルトはOFF）
		$mail->CharSet = 'utf-8';
		$mail->SMTPSecure = $smtp_config['protocol'];
		$mail->Host = $smtp_config['host'];
		$mail->Port = $smtp_config['port'];
		$mail->IsHTML(false);
		$mail->Username = $smtp_config['user'];
		$mail->Password = $smtp_config['pass'];
		$mail->SetFrom($smtp_config['user']);
		$mail->From     = $smtp_config['from'];
		$mail->Subject = $subject;
		$mail->Body = $adminBody;

		//BCCの送信先をセット（カンマ区切りに対応していないため）
		if (!empty($BccMail)) {
			$BccMailArr = explode(',', $BccMail);
			foreach ($BccMailArr as $BccVal) {
				$mail->addBCC($BccVal);
			}
		}

		//toの送信先をセット（カンマ区切りに対応していないため）
		$toArr = explode('reiya3141@gmail.com', $to);
		foreach ($toArr as $toVal) {
			if (!empty($toVal)) {
				$mail->AddAddress($toVal);
			}
		}

		$mail->addReplyTo($post_mail);
		$mail->SMTPOptions = array('ssl' => array('verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true));//PHP5.6以上の場合で送信失敗する場合に有効化してみて下さい。

		//添付ファイルの処理
		if (isset($_POST['upfilePath'])) {
			$file_count = count($_POST['upfilePath']);
			for ($i = 0; $i < $file_count; $i++) {
				if (isset($_POST['upfilePath'][$i])) {
					//$mail->AddAttachment($_POST['upfilePath'][$i]);
					$mail->addAttachment($_POST['upfilePath'][$i], mb_encode_mimeheader(@$_POST['upfileOriginName'][$i]));
				}
			}
		}

		//送信処理
		if (!$mail->Send()) {
			//$message  = "Message was not sent<br/ >";
			//$message .= "Mailer Error: " . $mailer->ErrorInfo;
			//echo "Mailer Error: " . $mailer->ErrorInfo;
			exit('残念ながら送信失敗しました。' . $mailer->ErrorInfo);
		} else {
			//$message  = "Message has been sent";
		}

		//ユーザー宛自動返信メール
		if ($remail == 1 && !empty($post_mail)) {

			$mail = new PHPMailer();
			$mail->IsSMTP(); //稀にサーバーによってはこれがあることで動作しないことがあるので、その場合、コメントアウトで無効化してみて下さい。
			$mail->SMTPDebug = 0; // debugging: 1 = errors and messages, 2 = messages only
			$mail->SMTPAuth = true; //稀にサーバーによってはこれがあることで動作しないことがあるので、その場合、コメントアウトで無効化してみて下さい。（デフォルトはOFF）
			$mail->CharSet = 'utf-8';
			$mail->SMTPSecure = $smtp_config['protocol'];
			$mail->Host = $smtp_config['host'];
			$mail->Port = $smtp_config['port'];
			$mail->IsHTML(false);
			$mail->Username = $smtp_config['user'];
			$mail->Password = $smtp_config['pass'];
			$mail->SetFrom($smtp_config['user']);
			$mail->From     = $smtp_config['from'];
			$mail->FromName = mb_encode_mimeheader($refrom_name); //差出人の名前	
			$mail->Subject = $re_subject;
			$mail->Body = $userBody;
			$mail->AddAddress($post_mail);
			$mail->addReplyTo($smtp_config['from']);
			//$mail->SMTPOptions = array('ssl' => array('verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true));//PHP5.6以上の場合で送信失敗する場合に有効化してみて下さい。

			//送信処理
			if (!$mail->Send()) {
				//$message  = "Message was not sent<br/ >";
				//$message .= "Mailer Error: " . $mailer->ErrorInfo;
			} else {
				//$message  = "Message has been sent";
			}
		}

		//----------------------------------------------------------------------
		//  SMTP送信処理（END）
		//----------------------------------------------------------------------
	} else {

		//-fオプションによるエンベロープFrom（Return-Path）の設定(safe_modeがOFFの場合かつ上記設定がONの場合のみ実施)
		if ($use_envelope == 0) {
			$result = mb_send_mail($to, $subject, $adminBody, $header);
			if ($remail == 1 && !empty($post_mail)) mail($post_mail, $re_subject, $userBody, $reheader);
		} else {
			$result = mb_send_mail($to, $subject, $adminBody, $header, '-f' . $from);
			if ($remail == 1 && !empty($post_mail)) mail($post_mail, $re_subject, $userBody, $reheader, '-f' . $from);
		}
	}

	//サーバ上の一時ファイルを削除
	$dir = rtrim($tmp_dir_name, '/');
	deleteFile($dir, $tempFileDel);

	//CSVバックアップ処理
	if ($csv_backup == 1) {
		csvBackup($csv_file_path, $csv_data_esc, $regData);
	}
} else if ($confirmDsp == 1) {

	/*　▼▼▼送信確認画面のレイアウト▼▼▼　*/
?>
	<!DOCTYPE HTML>
	<html lang="ja">

	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
		<meta name="format-detection" content="telephone=no">
		<title>確認画面</title>
		<style type="text/css">
			#formWrap {
				width: 700px;
				margin: 0 auto;
				color: #555;
				line-height: 120%;
				font-size: 90%;
			}

			table.formTable {
				width: 100%;
				margin: 0 auto;
				border-collapse: collapse;
			}

			table.formTable td,
			table.formTable th {
				border: 1px solid #ccc;
				padding: 10px;
			}

			table.formTable th {
				width: 30%;
				font-weight: normal;
				background: #efefef;
				text-align: left;
			}

			p.error_messe {
				margin: 5px 0;
				color: red;
			}

			@media screen and (max-width:572px) {
				#formWrap {
					width: 95%;
					margin: 0 auto;
				}

				table.formTable th,
				table.formTable td {
					width: auto;
					display: block;
				}

				table.formTable th {
					margin-top: 5px;
					border-bottom: 0;
				}

				form input[type="submit"],
				form input[type="reset"],
				form input[type="button"] {
					display: block;
					width: 100%;
					height: 40px;
				}
			}
		</style>

		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>

		<!-- reCAPTCHAの処理 -->
		<?php if ($recaptcha['conf'] == 1) { //reCAPTCHA機能がONの場合のみ実施する「?hl=en」のパラメータで言語指定可能
		?>
			<script src="https://www.google.com/recaptcha/api.js" async defer></script>

			<script>
				$(function() {
					$('form [type="submit"]').prop('disabled', true);
				});

				function recaptchaCallback(code) {
					if (code != "") {
						$('form [type="submit"]').prop('disabled', false);
					}
				}

				function recaptchaCallbackTimeout() {
					$('form [type="submit"]').prop('disabled', true);
				}
			</script>
		<?php } ?>
		<!-- recaptchaの処理ここまで -->
	</head>

	<body>

		<!-- ▲ Headerやその他コンテンツなど ▲-->

		<!-- ▼************ 送信内容表示部 ************ ▼-->
		<div id="formWrap">
			<?php if ($empty_flag == 1) { ?>
				<div align="center">
					<h4>入力にエラーがあります。下記をご確認の上「戻る」ボタンにて修正をお願い致します。</h4>
					<?php echo $errm; ?><br /><br /><input type="button" value=" 前画面に戻る " onClick="history.back()">
				</div>
			<?php } else { ?>
				<h3>確認画面</h3>
				<p align="center">以下の内容で間違いがなければ、「送信する」ボタンを押してください。</p>
				<?php iniGetAddMailXHeader($iniAddX); //php.ini設定チェック
				?>
				<form action="<?php echo h($_SERVER['SCRIPT_NAME']); ?>" method="POST">
					<table class="formTable">
						<?php echo confirmOutput($_POST); //入力内容を表示
						?>
					</table>

					<?php if ($recaptcha['conf'] == 1) { //reCAPTCHA機能がONの場合のみ実施する
					?>
						<!-- reCAPTCHAの認証画像の表示（文言やスタイルなどは自由に編集下さい） -->
						<div class="mt20 mb20 taC" style="width:320px; margin:0 auto;">
							<p>お手数ですが下記にチェックを入れて下さい。
							<div class="g-recaptcha" data-callback="recaptchaCallback" data-expired-callback="recaptchaCallbackTimeout" data-sitekey="<?php echo $recaptcha['sitekey']; ?>"></div><!-- data-sitekeyにsitekeyを記述 -->
						</div>
						<!-- reCAPTCHAの認証画像の表示ここまで -->
					<?php } ?>

					<p align="center"><input type="hidden" name="mail_set" value="confirm_submit">
						<input type="hidden" name="httpReferer" value="<?php echo h($_SERVER['HTTP_REFERER']); ?>">
						<?php
						if (isset($_FILES[$upfile_key]["tmp_name"])) {
							$file_count = count($_FILES[$upfile_key]["tmp_name"]);
							for ($i = 0; $i < $file_count; $i++) {
								if (!empty($_FILES[$upfile_key]["tmp_name"][$i])) {
						?>
									<input type="hidden" name="upfilePath[]" value="<?php echo h($upFilePath[$i]); ?>">
									<input type="hidden" name="upfileType[]" value="<?php echo h($_FILES[$upfile_key]['type'][$i]); ?>">
									<input type="hidden" name="upfileOriginName[]" value="<?php echo h($_FILES[$upfile_key]['name'][$i]); ?>">
						<?php
								}
							}
						}
						?>
						<input type="submit" value="　送信する　">
						<input type="button" value="前画面に戻る" onClick="history.back()">
					</p>
				</form>
			<?php copyright();
			} ?>
		</div><!-- /formWrap -->
		<!-- ▲ *********** 送信内容確認部 ************ ▲-->

		<!-- ▼ Footerその他コンテンツなど ▼-->
	</body>

	</html>
<?php
	/* ▲▲▲送信確認画面のレイアウト▲▲▲　*/
}

if (($jumpPage == 0 && $sendmail == 1) || ($jumpPage == 0 && ($confirmDsp == 0 && $sendmail == 0))) {

	/* ▼▼▼送信完了画面のレイアウト ※送信完了後に指定のページに移動しない場合のみ表示▼▼▼　*/
?>
	<!DOCTYPE HTML>
	<html lang="ja">

	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
		<meta name="format-detection" content="telephone=no">
		<title>完了画面</title>
	</head>

	<body>
		<div align="center">
			<?php if ($empty_flag == 1) { ?>
				<h4>入力にエラーがあります。下記をご確認の上「戻る」ボタンにて修正をお願い致します。</h4>
				<div style="color:red"><?php echo $errm; ?></div>
				<br /><br /><input type="button" value=" 前画面に戻る " onClick="history.back()">
		</div>
	</body>

	</html>
<?php } else { ?>
	送信ありがとうございました。<br />
	送信は正常に完了しました。<br /><br />
	<a href="<?php echo $site_top; ?>">トップページへ戻る&raquo;</a>
	</div>
	<?php copyright(); ?>
	<!--  CV率を計測する場合ここにAnalyticsコードを貼り付け -->
	</body>

	</html>
<?php
				/* ▲▲▲送信完了画面のレイアウト ※送信完了後に指定のページに移動しない場合のみ表示▲▲▲　*/
			}
		}
		//確認画面無しの場合の表示、指定のページに移動する設定の場合、エラーチェックで問題が無ければ指定ページヘリダイレクト
		else if (($jumpPage == 1 && $sendmail == 1) || $confirmDsp == 0) {
			if ($empty_flag == 1) { ?>
	<div align="center">
		<h4>入力にエラーがあります。下記をご確認の上「戻る」ボタンにて修正をお願い致します。</h4>
		<div style="color:red"><?php echo $errm; ?></div><br /><br /><input type="button" value=" 前画面に戻る " onClick="history.back()">
	</div>
<?php
			} else {
				header("Location: " . $thanksPage);
			}
		}

		//----------------------------------------------------------------------
		//  関数定義(START)
		//----------------------------------------------------------------------
		function checkMail($str)
		{
			$mailaddress_array = explode('@', $str);
			if (preg_match("/^[\.!#%&\-_0-9a-zA-Z\?\/\+]+\@[!#%&\-_0-9a-zA-Z]+(\.[!#%&\-_0-9a-zA-Z]+)+$/", "$str") && count($mailaddress_array) == 2) {
				return true;
			} else {
				return false;
			}
		}
		function h($string)
		{
			global $encode;
			return htmlspecialchars($string, ENT_QUOTES, $encode);
		}
		function sanitize($arr)
		{
			if (is_array($arr)) {
				return array_map('sanitize', $arr);
			}
			return str_replace("\0", "", $arr);
		}
		//Shift-JISの場合に誤変換文字の置換関数
		function sjisReplace($arr, $encode)
		{
			foreach ($arr as $key => $val) {
				$key = str_replace('＼', 'ー', $key);
				$resArray[$key] = $val;
			}
			return $resArray;
		}
		//送信メールにPOSTデータをセットする関数
		function postToMail($arr)
		{
			global $hankaku, $hankaku_array, $ConfirmEmail;
			$resArray = '';
			foreach ($arr as $key => $val) {
				$out = '';
				if (is_array($val)) {
					foreach ($val as $key02 => $item) {
						//連結項目の処理
						if (is_array($item)) {
							$out .= connect2val($item);
						} else {
							$out .= $item . ', ';
						}
					}
					$out = rtrim($out, ', ');
				} else {
					$out = $val;
				} //チェックボックス（配列）追記ここまで

				if (version_compare(PHP_VERSION, '5.1.0', '<=')) { //PHP5.1.0以下の場合のみ実行（7.4でget_magic_quotes_gpcが非推奨になったため）
					if (get_magic_quotes_gpc()) {
						$out = stripslashes($out);
					}
				}

				//全角→半角変換
				if ($hankaku == 1) {
					$out = zenkaku2hankaku($key, $out, $hankaku_array);
				}

				if ($out != "confirm_submit" && $key != "httpReferer" && $key != "upfilePath" && $key != "upfileType" && $key != $ConfirmEmail) {

					if ($key == "upfileOriginName" && $out != '') {
						$key = '添付ファイル';
					} elseif ($key == "upfileOriginName" && $out == '') {
						continue;
					}

					$resArray .= "【 " . $key . " 】 " . $out . "\n";
				}
			}
			return $resArray;
		}
		//確認画面の入力内容出力用関数
		function confirmOutput($arr)
		{
			global $upFilePath, $upfile_key, $encode, $hankaku, $hankaku_array, $useToken, $confirmDsp, $replaceStr;
			$html = '';
			foreach ($arr as $key => $val) {
				$out = '';
				if (is_array($val)) {
					foreach ($val as $key02 => $item) {
						//連結項目の処理
						if (is_array($item)) {
							$out .= connect2val($item);
						} else {
							$out .= $item . ', ';
						}
					}
					$out = rtrim($out, ', ');
				} else {
					$out = $val;
				} //チェックボックス（配列）追記ここまで

				if (version_compare(PHP_VERSION, '5.1.0', '<=')) { //PHP5.1.0以下の場合のみ実行（7.4でget_magic_quotes_gpcが非推奨になったため）
					if (get_magic_quotes_gpc()) {
						$out = stripslashes($out);
					}
				}

				//全角→半角変換
				if ($hankaku == 1) {
					$out = zenkaku2hankaku($key, $out, $hankaku_array);
				}

				$out = nl2br(h($out)); //※追記 改行コードを<br>タグに変換
				$key = h($key);
				$out = str_replace($replaceStr['before'], $replaceStr['after'], $out); //機種依存文字の置換処理

				$html .= "<tr><th>" . $key . "</th><td>" . mb_convert_kana($out, "K", $encode);
				$html .= '<input type="hidden" name="' . $key . '" value="' . str_replace(array("<br />", "<br>"), "", mb_convert_kana($out, "K", $encode)) . '" />';
				$html .= "</td></tr>\n";
			}

			//添付ファイル表示処理
			if (isset($_FILES[$upfile_key]["tmp_name"])) {
				$file_count = count($_FILES[$upfile_key]["tmp_name"]);
				$j = 1;
				for ($i = 0; $i < $file_count; $i++, $j++) {
					//添付があったらファイル名表示
					if (!empty($upFilePath[$i])) {
						$html .= "<tr><th>添付ファイル名{$j}.</th><td>{$_FILES[$upfile_key]['name'][$i]}</td></tr>\n";
					}
				}
			}

			//トークンをセット
			if ($useToken == 1 && $confirmDsp == 1) {
				$token = sha1(uniqid(mt_rand(), true));
				$_SESSION['mailform_token'] = $token;
				$html .= '<input type="hidden" name="mailform_token" value="' . $token . '" />';
			}

			return $html;
		}
		//全角→半角変換
		function zenkaku2hankaku($key, $out, $hankaku_array)
		{
			global $encode;
			if (is_array($hankaku_array) && function_exists('mb_convert_kana')) {
				foreach ($hankaku_array as $hankaku_array_val) {
					if ($key == $hankaku_array_val) {
						$out = mb_convert_kana($out, 'a', $encode);
					}
				}
			}
			return $out;
		}
		//配列連結の処理
		function connect2val($arr)
		{
			$out = '';
			foreach ($arr as $key => $val) {
				if ($key === 0 || $val == '') { //配列が未記入（0）、または内容が空のの場合には連結文字を付加しない（型まで調べる必要あり）
					$key = '';
				} elseif (strpos($key, "円") !== false && $val != '' && preg_match("/^[0-9]+$/", $val)) {
					$val = number_format($val); //金額の場合には3桁ごとにカンマを追加
				}
				$out .= $val . $key;
			}
			return $out;
		}
		//管理者宛送信メールヘッダ
		function adminHeader($post_mail, $BccMail)
		{
			global $encode, $from;

			//メールで日本語使用するための設定
			//	mb_language("Ja") ;
			//	mb_internal_encoding($encode);

			$header = "From: $from\n";
			if (!empty($BccMail)) {
				$header .= "Bcc: $BccMail\n";
			}
			if (!empty($post_mail)) {
				$header .= "Reply-To: " . $post_mail . "\n";
			}

			//----------------------------------------------------------------------
			//  添付ファイル処理(START)
			//----------------------------------------------------------------------
			if (isset($_POST['upfilePath'])) {
				$header .= "MIME-Version: 1.0\n";
				$header .= "Content-Type: multipart/mixed; boundary=\"__PHPFACTORY__\"\n";
			} else {
				$header .= "Content-Type:text/plain;charset=iso-2022-jp\nX-Mailer: PHP/" . phpversion();
			}

			return $header;
		}
		//管理者宛送信メールボディ
		function mailToAdmin($arr, $subject, $mailFooterDsp, $mailSignature, $encode, $confirmDsp)
		{
			global $rename;
			$adminBody = '';
			//----------------------------------------------------------------------
			//  添付ファイル処理(START)
			//----------------------------------------------------------------------
			if (isset($_POST['upfilePath'])) {
				$adminBody .= "--__PHPFACTORY__\n";
				$adminBody .= "Content-Type: text/plain; charset=\"ISO-2022-JP\"\n";
				$adminBody .= "\n";
			}
			//----------------------------------------------------------------------
			//  添付ファイル処理(END)
			//----------------------------------------------------------------------

			$adminBody .= "「" . $subject . "」からメールが届きました\n\n";
			$adminBody .= "＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝\n\n";
			$adminBody .= postToMail($arr); //POSTデータを関数からセット
			$adminBody .= "\n＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝\n";
			$adminBody .= "送信された日時：" . date("Y/m/d (D) H:i:s", time()) . "\n";
			$adminBody .= "送信者のIPアドレス：" . @$_SERVER["REMOTE_ADDR"] . "\n";
			$adminBody .= "送信者のホスト名：" . getHostByAddr(getenv('REMOTE_ADDR')) . "\n";
			if ($confirmDsp != 1) {
				$adminBody .= "問い合わせのページURL：" . @h($_SERVER['HTTP_REFERER']) . "\n";
			} else {
				$adminBody .= "問い合わせのページURL：" . @$arr['httpReferer'] . "\n";
			}
			if ($mailFooterDsp == 1) $adminBody .= $mailSignature . "\n";

			//----------------------------------------------------------------------
			//  添付ファイル処理(START)
			//----------------------------------------------------------------------

			if (isset($_POST['upfilePath'])) {

				$default_internal_encode = mb_internal_encoding();
				if ($default_internal_encode != $encode) {
					mb_internal_encoding($encode);
				}

				$file_count = count($_POST['upfilePath']);

				for ($i = 0; $i < $file_count; $i++) {
					if (isset($_POST['upfilePath'][$i])) {
						$adminBody .= "--__PHPFACTORY__\n";
						$filePath = h(@$_POST['upfilePath'][$i]); //ファイルパスを指定
						$fileName = h(mb_encode_mimeheader(@$_POST['upfileOriginName'][$i]));
						$imgType = h(@$_POST['upfileType'][$i]);

						//ファイル名が文字化けする場合には連番ファイル名とする
						if ($rename == 1) {
							$fileNameArray = explode(".", $fileName);
							$fileName = $i . '.' . end($fileNameArray);
						}

						# 添付ファイルへの処理をします。
						$handle = @fopen($filePath, 'r');
						$attachFile = @fread($handle, filesize($filePath));
						@fclose($handle);
						$attachEncode = base64_encode($attachFile);

						$adminBody .= "Content-Type: {$imgType}; name=\"$filePath\"\n";
						$adminBody .= "Content-Transfer-Encoding: base64\n";
						$adminBody .= "Content-Disposition: attachment; filename=\"$fileName\"\n";
						$adminBody .= "\n";
						$adminBody .= chunk_split($attachEncode) . "\n";
					}
				}
				$adminBody .= "--__PHPFACTORY__--\n";
			}
			//----------------------------------------------------------------------
			//  添付ファイル処理(END)
			//----------------------------------------------------------------------

			//return mb_convert_encoding($adminBody,"JIS",$encode);
			return $adminBody;
		}

		//ユーザ宛送信メールヘッダ
		function userHeader($refrom_name, $to, $encode)
		{
			$reheader = "From: ";
			if (!empty($refrom_name)) {
				$default_internal_encode = mb_internal_encoding();
				if ($default_internal_encode != $encode) {
					mb_internal_encoding($encode);
				}
				$reheader .= mb_encode_mimeheader($refrom_name) . " <" . $to . ">\nReply-To: " . $to;
			} else {
				$reheader .= "$to\nReply-To: " . $to;
			}
			$reheader .= "\nContent-Type: text/plain;charset=iso-2022-jp\nX-Mailer: PHP/" . phpversion();
			return $reheader;
		}
		//ユーザ宛送信メールボディ
		function mailToUser($arr, $dsp_name, $remail_text, $mailFooterDsp, $mailSignature, $encode)
		{
			global $smpton;
			$userBody = '';
			if (isset($arr[$dsp_name])) $userBody = h($arr[$dsp_name]) . " 様\n";
			$userBody .= $remail_text;
			$userBody .= "\n＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝\n\n";
			$userBody .= postToMail($arr); //POSTデータを関数からセット
			$userBody .= "\n＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝\n\n";
			$userBody .= "送信日時：" . date("Y/m/d (D) H:i:s", time()) . "\n";
			if ($mailFooterDsp == 1) $userBody .= $mailSignature;

			if ($smpton == 1) {
				return $userBody;
			} else {
				return mb_convert_encoding($userBody, "JIS", $encode);
			}
		}
		//必須チェック関数
		function requireCheck($require)
		{
			$res['errm'] = '';
			$res['empty_flag'] = 0;
			foreach ($require as $requireVal) {
				$existsFalg = '';
				foreach ($_POST as $key => $val) {
					if ($key == $requireVal) {

						//連結指定の項目（配列）のための必須チェック
						if (is_array($val)) {
							$connectEmpty = 0;
							foreach ($val as $kk => $vv) {
								if (is_array($vv)) {
									foreach ($vv as $kk02 => $vv02) {
										if ($vv02 == '') {
											$connectEmpty++;
										}
									}
								}
							}
							if ($connectEmpty > 0) {
								$res['errm'] .= "<p class=\"error_messe\">【" . h($key) . "】は必須項目です。</p>\n";
								$res['empty_flag'] = 1;
							}
						}
						//デフォルト必須チェック
						elseif ($val == '') {
							$res['errm'] .= "<p class=\"error_messe\">【" . h($key) . "】は必須項目です。</p>\n";
							$res['empty_flag'] = 1;
						}

						$existsFalg = 1;
						break;
					}
				}
				if ($existsFalg != 1) {
					$res['errm'] .= "<p class=\"error_messe\">【" . $requireVal . "】が未選択です。</p>\n";
					$res['empty_flag'] = 1;
				}
			}

			return $res;
		}
		//リファラチェック
		function refererCheck($Referer_check, $Referer_check_domain)
		{
			if ($Referer_check == 1 && !empty($Referer_check_domain)) {
				if (strpos(h($_SERVER['HTTP_REFERER']), $Referer_check_domain) === false) {
					return exit('<p align="center">リファラチェックエラー。フォームページのドメインとこのファイルのドメインが一致しません</p>');
				}
			}
		}
		function copyright()
		{
			echo '';
		}
		//ファイル添付用一時ファイルの削除
		function deleteFile($dir, $tempFileDel)
		{
			global $permission_file;

			if ($tempFileDel == 1) {
				if (isset($_POST['upfilePath'])) {
					foreach ($_POST['upfilePath'] as $key => $val) {
						foreach ($permission_file as $permission_file_val) {
							if (strpos(strtolower($val), $permission_file_val) !== false && file_exists($val)) {
								if (strpos($val, 'htaccess') !== false) exit();
								unlink($val);
								break;
							}
						}
					}
				}

				//ゴミファイルの削除（1時間経過したもののみ）※確認画面→戻る→確認画面の場合、先の一時ファイルが残るため
				if (file_exists($dir) && !empty($dir)) {
					$handle = opendir($dir);
					while ($temp_filename = readdir($handle)) {
						if (strpos($temp_filename, 'temp_file_') !== false) {
							if (strtotime(date("Y-m-d H:i:s", filemtime($dir . "/" . $temp_filename))) < strtotime(date("Y-m-d H:i:s", strtotime("-1 hour")))) {
								@unlink("$dir/$temp_filename");
							}
						}
					}
				}
			}
		}
		//php.iniのmail.add_x_headerのチェック
		function iniGetAddMailXHeader($iniAddX)
		{
			if ($iniAddX == 1) {
				if (@ini_get('mail.add_x_header') == 1) echo '<p style="color:red">php.iniの「mail.add_x_header」がONになっています。添付がうまくいかない可能性が高いです。htaccessファイルかphp.iniファイルで設定を変更してOFFに設定下さい。サーバーにより設定方法は異なります。詳しくはサーバーマニュアル等、またはサーバー会社にお問い合わせ下さい。正常に添付できていればOKです。このメーッセージはmail.php内のオプションで非表示可能です</p>';
			}
		}

		//トラバーサル対策
		function traversalCheck($tmp_dir_name)
		{
			if (isset($_POST['upfilePath']) && is_array($_POST['upfilePath'])) {
				foreach ($_POST['upfilePath'] as $val) {
					if (strpos($val, $tmp_dir_name) === false || strpos($val, 'temp_file_') === false) exit('Warning!! you are wrong..1'); //ルール違反は強制終了
					if (substr_count($tmp_dir_name, '/') != substr_count($val, '/')) exit('Warning!! you are wrong..2'); //ルール違反は強制終了
					if (strpos($val, 'htaccess') !== false) exit('Warning!! you are wrong..3');
					if (!file_exists($val)) exit('Warning!! you are wrong..4');
					if (strpos(str_replace($tmp_dir_name, '', $val), '..') !== false)  exit('Warning!! you are wrong..5');
				}
			}
		}
		//文字列をCSV出力形式に変換
		function csv_string($str)
		{
			global $encode;
			$csv_data = $str;
			$csv_data = str_replace('"', '""', $csv_data);
			$csv_data = str_replace(',', '、', $csv_data);
			return '"' . mb_convert_encoding($csv_data, "sjis-win", $encode) . '"';
		}
		//CSV生成と登録
		function csvBackup($csv_file_path, $csv_data_esc, $regData)
		{
			global $attach2Csv;
			$countRegData = count($regData);
			//----------------------------------------------------------------------
			//  CSVファイルの存在チェック(BEGIN)
			//----------------------------------------------------------------------
			//ファイルが存在しない場合にはヘッダーをつけてファイルを生成します
			if (!file_exists($csv_file_path)) {
				$csv  = ""; //初期値
				//登録データが指定されている場合の処理
				if ($countRegData > 0) {
					foreach ($regData as $regDataVal) {
						$csv .= csv_string($regDataVal) . ",";
					}
				}
				//登録データが指定されていない場合にはPOSTデータすべてを保存
				else {

					foreach ($_POST as $key => $val) {
						if ($val != "confirm_submit" && $key != "httpReferer" && $key != "upfilePath" && $key != "upfileType" && $key != "upfileOriginName") {
							$csv .= csv_string($key) . ",";
						}
					}
				}

				$csv .= ($attach2Csv == 1) ? csv_string("添付ファイル名") . "," : ''; //添付ファイル（不要な場合削除可）
				$csv .= csv_string("問い合わせのページURL") . ","; //問い合わせのページURL（不要な場合削除可）
				$csv .= csv_string('問い合わせ日付') . ","; //申し込み日付（不要な場合削除可）
				$csv .= csv_string('IPアドレス') . ","; //IPアドレス（不要な場合削除可）

				$csv = rtrim($csv, ",");
				$csv .= "\n";

				$fp = fopen($csv_file_path, 'a'); //ファイルを生成します
				flock($fp, LOCK_EX);
				fwrite($fp, $csv);
				fflush($fp);
				flock($fp, LOCK_UN);
				fclose($fp);
				@chmod($csv_file_path, 0666);
			}
			//----------------------------------------------------------------------
			//  CSVファイルの存在チェック(END)
			//----------------------------------------------------------------------

			//----------------------------------------------------------------------
			//  CSV形式での保存処理(BEGIN)
			//----------------------------------------------------------------------
			// 入力フォームで入力された内容の保存
			$csv  = ""; //初期値

			//登録データが指定されている場合の処理
			if ($countRegData > 0) {
				foreach ($regData as $regDataVal) {
					//データ未入力の場合には空データで埋める
					$out = "";

					if (isset($_POST[$regDataVal]) && $_POST[$regDataVal] != "") {
						if (is_array($_POST[$regDataVal])) {
							foreach ($_POST[$regDataVal] as $item) {

								//連結項目の処理
								if (is_array($item)) {
									$out .= connect2val($item);
								} else {
									$out .= $item . ', ';
								}
							}
							$out = rtrim($out, ", ");
						} else {
							$out = $_POST[$regDataVal];
						}
					}

					$writeData = $out;

					if (version_compare(PHP_VERSION, '5.1.0', '<=')) { //PHP5.1.0以下の場合のみ実行（7.4でget_magic_quotes_gpcが非推奨になったため）
						if (get_magic_quotes_gpc()) {
							$writeData = stripslashes($writeData);
						}
					}
					//先頭に0が含まれていたら「=」を追記　※エクセル先頭0消える問題対策
					if (strpos($writeData, '0') === 0 && $csv_data_esc == 1) {
						$csv .= '=';
					}
					$csv .= csv_string($writeData) . ",";
				}
			}
			//登録データが指定されていない場合にはPOSTデータすべてを保存
			else {

				foreach ($_POST as $key => $val) {
					$out = '';
					if (is_array($val)) {
						foreach ($val as $item) {
							//連結項目の処理
							if (is_array($item)) {
								$out .= connect2val($item);
							} else {
								$out .= $item . ', ';
							}
						}
						$out = rtrim($out, ", ");
					} else {
						$out = $val;
					}

					if (version_compare(PHP_VERSION, '5.1.0', '<=')) { //PHP5.1.0以下の場合のみ実行（7.4でget_magic_quotes_gpcが非推奨になったため）
						if (get_magic_quotes_gpc()) {
							$out = stripslashes($out);
						}
					}

					if ($out != "confirm_submit" && $key != "httpReferer" && $key != "upfilePath" && $key != "upfileType" && $key != "upfileOriginName") {
						//先頭に0が含まれていたら「=」を追記　※エクセル先頭0消える問題対策
						if (strpos($out, '0') === 0 && $csv_data_esc == 1) {
							$csv .= '=';
						}
						$csv .= csv_string($out) . ",";
					}
				}
			}

			//添付ファイル名表示
			if ($attach2Csv == 1) {
				$upfilename = '';
				if (isset($_POST['upfileOriginName'])) {
					foreach ($_POST['upfileOriginName'] as $val) {
						$upfilename .= $val . '、';
					}
					$upfilename = rtrim($upfilename, '、');
				}
				$csv .= csv_string($upfilename) . ",";
			}

			$csv .= (isset($_POST["httpReferer"])) ? csv_string(@$_POST["httpReferer"]) . "," : csv_string(@$_SERVER['HTTP_REFERER']) . ","; //問い合わせのページURL（不要な場合削除可）
			$csv .= csv_string(@date("Y/m/d (D) H:i:s", time())) . ","; //申し込み日付（不要な場合削除可）
			$csv .= csv_string(@$_SERVER["REMOTE_ADDR"]) . ","; //IPアドレス（不要な場合削除可）
			$csv = rtrim($csv, ",");
			$csv .= "\n"; //I改行コード挿入
			$fp = fopen($csv_file_path, 'a');

			flock($fp, LOCK_EX);
			fwrite($fp, $csv);
			fflush($fp);
			flock($fp, LOCK_UN);
			fclose($fp);
			//----------------------------------------------------------------------
			//  CSV形式での保存処理(END)
			//----------------------------------------------------------------------
		}
		//スパムチェック
		function spamCheck($ng_ip, $ng_word_name, $ng_word, $stri_check)
		{
			global $encode;
			$res = array();
			$res['empty_flag'] = 0;
			$res['errm'] = '';
			foreach ($_POST as $key => $val) {

				//----------------------------------------------------------------------
				//  禁止IPチェック　引っかかった場合、メッセージを表示(BEGIN)
				//----------------------------------------------------------------------
				if (count($ng_ip) > 0) {
					foreach ($ng_ip as $ng_ip_val) {
						if ($ng_ip_val == $_SERVER["REMOTE_ADDR"]) {
							$res['errm'] .= "<p class=\"error_messe\">禁止IPアドレスです。</p>\n";
							$res['empty_flag'] = 1;
							break 2;
						}
					}
				}
				//----------------------------------------------------------------------
				//  禁止IPチェック(END)
				//----------------------------------------------------------------------

				//----------------------------------------------------------------------
				//  スパムチェック　※禁止ワードに引っかかった場合、メッセージを表示(BEGIN)
				//----------------------------------------------------------------------
				if ($key == $ng_word_name && count($ng_word) > 0) {
					foreach ($ng_word as $ng_word_val) {
						if ($stri_check == 1) {
							$val = strtolower($val);
							$ng_word_val = strtolower($ng_word_val);
						}
						if (mb_strpos($val, $ng_word_val, 0, $encode) !== false) {
							$res['errm'] .= "<p class=\"error_messe\">禁止文字列が含まれています。</p>\n";
							$res['empty_flag'] = 1;
							break 2;
						}
					}
				}
				//----------------------------------------------------------------------
				//  スパムチェック(END)
				//----------------------------------------------------------------------
			}
			return $res;
		}
		//ダウンロードダイアログ
		function csvDialog($csv_file_path, $userid, $password)
		{
			if (!file_exists($csv_file_path)) exit('CSVファイルがまだありません。CSV保存機能がONの場合に初回送信時に自動生成されます。');
			if (session_name() == 'PHPMAILFORMSYSTEM') {
				$_SESSION = array(); //既存セッションを破棄(トークン用のセッション)
				session_destroy(); //既存セッションを破棄(トークン用のセッション)
			}

			session_name('PHPMAILFORMCSVSYSTEM'); //セキュリティを上げるため念のためトークン用セッションとは異なるものとする
			session_start();

			if (isset($_GET['logout'])) {
				$_SESSION = array();
				session_destroy(); //セッションを破棄
			}
			$login_error = '';
			# セッション変数を初期化
			if (!isset($_SESSION['auth'])) {
				$_SESSION['auth'] = FALSE;
			}
			if (!empty($_POST['userid']) && !empty($_POST['password'])) {
				if (
					$_POST['userid'] === $userid &&
					$_POST['password'] === $password
				) {
					$oldSid = session_id();
					session_regenerate_id(TRUE);
					if (version_compare(PHP_VERSION, '5.1.0', '<')) {
						$path = session_save_path() != '' ? session_save_path() : '/tmp';
						$oldSessionFile = $path . '/sess_' . $oldSid;
						if (file_exists($oldSessionFile)) {
							unlink($oldSessionFile);
						}
					}
					$_SESSION['auth'] = TRUE;
				}
				if ($_SESSION['auth'] === FALSE) {
					$login_error = '<center><font color="red">ユーザーIDかパスワードに誤りがあります。</font></center>';
				}
			}
			if ($_SESSION['auth'] !== TRUE) {
?>
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
	<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja">

	<head>
		<meta name="robots" content="noindex,nofollow" />
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>CSVダウンロード画面</title>
		<style type="text/css">
			#login_form {
				width: 500px;
				margin: 25px auto;
				border: 1px solid #ccc;
				border-radius: 10px;
				box-shadow: 0 0px 7px #aaa;
				font-weight: normal;
				padding: 16px 16px 20px;
				color: #666;
				line-height: 1.3;
				font-size: 90%;
			}

			form .input {
				font-size: 20px;
				margin: 2px 6px 10px 0;
				padding: 3px;
				width: 97%;
			}

			input[type="text"],
			input[type="password"],
			input[type="file"],
			input[type="button"],
			input[type="submit"],
			input[type="reset"] {
				background-color: #FFFFFF;
				border: 1px solid #999;
			}

			.button-primary {
				border: 1px solid #000;
				border-radius: 11px;
				cursor: pointer;
				font-size: 18px;
				padding: 3px 10px;
				width: 450px;
				height: 38px;
			}

			.Tac {
				text-align: center
			}
		</style>
	</head>

	<body>
		<?php if (isset($login_error)) echo $login_error; ?>
		<div id="login_form">

			<p class="Tac">CSVをダウンロードするには認証する必要があります。<br />
				ID、パスワードを記述して下さい。<br />管理者以外のアクセスは固くお断りします。</p>
			<form action="?mode=download" method="post">
				<label for="userid">ユーザーID</label>
				<input class="input" type="text" name="userid" id="userid" value="" style="ime-mode:disabled" />
				<label for="password">パスワード</label>
				<input class="input" type="password" name="password" id="password" value="" size="30" />
				<p class="Tac">
					<input class="button-primary" type="submit" name="login_submit" value="　認証　" />
				</p>
			</form>
		</div>
	</body>

	</html>
<?php
				exit();
			} else {
				header('Content-Type: application/octet-stream');
				header('Content-Disposition: attachment; filename=' . date('Y-m-d-H-i') . '.csv');
				header('Content-Transfer-Encoding: binary');
				header('Content-Length: ' . filesize($csv_file_path));
				readfile($csv_file_path);

				$_SESSION = array(); //セッションを破棄
				session_destroy(); //セッションを破棄
				exit();
			}
		}

		//reCAPTCHAの判定処理（認証エラーの場合は強制終了する）
		function getRecaptchaRes($secret_key)
		{
			//if(!isset($_POST['mail_set'])){
			// エラー判定
			if (!isset($_POST['g-recaptcha-response'])) {
				exit('認証エラー'); //問題があれば強制終了
			}

			// エンドポイント
			//$endpoint = 'https://www.google.com/recaptcha/api/siteverify?secret=' . $secret_key . '&response=' . h($_POST['g-recaptcha-response']) ;

			// 判定結果の取得
			$curl = curl_init();

			//		curl_setopt( $curl , CURLOPT_URL , $endpoint ) ;
			//		curl_setopt( $curl , CURLOPT_SSL_VERIFYPEER , false ) ;// 証明書の検証を行わない
			//		curl_setopt( $curl , CURLOPT_RETURNTRANSFER , true ) ;// curl_execの結果を文字列で返す
			//		curl_setopt( $curl , CURLOPT_TIMEOUT , 5 ) ;// タイムアウトの秒

			curl_setopt($curl, CURLOPT_URL, "https://www.google.com/recaptcha/api/siteverify");
			curl_setopt($curl, CURLOPT_POST, 1);
			curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query(array(
				'secret'   => $secret_key,
				'response' => h($_POST['g-recaptcha-response']),
			)));

			curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

			$json = curl_exec($curl);
			curl_close($curl);

			// JSONをオブジェクトに変換
			$obj = json_decode($json);

			// エラー判定
			if (!isset($obj->success) || !$obj->success) {
				exit('認証エラーです。');
			}
			unset($_POST['g-recaptcha-response']);
			//}
		}

		//連番付与用関数
		function get_count_num($countFilePath, $countPrefix, $addCount, $keta = 4)
		{

			$dsp_count = '';

			if (!file_exists($countFilePath) || !is_writable($countFilePath)) {
				exit("カウント保存用のファイルが存在しないかパーミッションが正しくありません。" . $countFilePath . "が存在するか、またはパーミッションが666等書き込み可能なものになっているか確認下さい");
			} else {
				$fp = fopen($countFilePath, "r+b") or die("fopen Error!!");
				if (flock($fp, LOCK_EX)) {

					$fpArray = explode(',', fgets($fp));
					$getCount = rtrim($fpArray[0]);
					$regCount = $getCount + 1;
					$dsp_count = $countPrefix . sprintf("%0" . $keta . "d", $regCount);

					ftruncate($fp, 0);
					rewind($fp);
					fwrite($fp, $regCount); // 書き込み
				}
				fflush($fp);
				flock($fp, LOCK_UN);
				fclose($fp);
			}

			return $dsp_count;
		}

		//----------------------------------------------------------------------
		//  関数定義(END)
		//----------------------------------------------------------------------
?>