# Discord VC開始通知Bot

[![Docker Image Version (tag latest semver)](https://img.shields.io/docker/v/skyzi000/discord-vc-notify-bot/latest)](https://hub.docker.com/r/skyzi000/discord-vc-notify-bot/tags)
[![Docker Pulls](https://img.shields.io/docker/pulls/skyzi000/discord-vc-notify-bot)](https://hub.docker.com/r/skyzi000/discord-vc-notify-bot)
[![Last Commit](https://img.shields.io/github/last-commit/Skyzi000/discord-vc-notify-bot)](https://github.com/Skyzi000/discord-vc-notify-bot/commits)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Skyzi000/discord-vc-notify-bot/Docker)](https://github.com/Skyzi000/discord-vc-notify-bot/actions/workflows/docker-publish.yml)

![example](https://raw.githubusercontent.com/Skyzi000/discord-vc-notify-bot/main/images/example.png)

Discordのボイスチャンネルへの入室を通知するBot

## 特徴

- シンプル
- カテゴリごとに通知チャンネルを設定できる
- 常時起動が簡単
- 更新が簡単
- イメージサイズが非常に小さい(約43MB程度)！
- Dockerがわからなくても(多分)使える

## コマンド

コマンドはBotにメンションする形で入力します

### setnc [チャンネルID]

カテゴリごとの通知チャンネルを設定します。

チャンネルIDを入力した場合は、IDで指定されたチャンネルをコマンドを入力したカテゴリの通知チャンネルに設定します。

![setnc-with-id](https://raw.githubusercontent.com/Skyzi000/discord-vc-notify-bot/main/images/setnc_with_id.png)

チャンネルIDを入力しない場合は、このコマンドを入力したチャンネルをそのカテゴリの通知チャンネルに設定します。

![setnc-without-id](https://raw.githubusercontent.com/Skyzi000/discord-vc-notify-bot/main/images/setnc_without_id.png)

### delnc

入力したカテゴリの通知設定を削除します。

## 初回起動(docker-composeを使用)

1. [Discord Developer Portal](https://discord.com/developers/applications)でBotアカウントを作成する
2. Botをサーバーに入れる
3. [docker-compose.yml](docker-compose.yml)をダウンロード(またはコピー)して好きなフォルダに置く
4. 同じフォルダに`secret_bot_token.txt`という名前のテキストファイルを作り、ボットのTokenをコピペする
5. （`docker-compose.yml`のあるフォルダ内で）`docker-compose up -d`で起動する
6. `docker-compose logs`で`vc-notify-bot | VC_notify(Botの名前) is ready!`のように表示されたらOK！

## 停止方法

1. `docker-compose.yml`のあるフォルダに移動(`cd`)する
2. `docker-compose down`で停止する

## 更新方法

1. `docker-compose.yml`のあるフォルダに移動(`cd`)する
2. `docker-compose pull`で新しいイメージを入手する
3. `config.txt`が更新されていたら更新する
4. `docker-compose up -d`で起動する

## 常時起動させる

`docker-compose.yml`の

```yml
        # restart: always
```

を

```yml
        restart: always
```

に変更(コメントアウトを解除)してから起動する
