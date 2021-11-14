# Discord VC開始通知Bot

[![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/Skyzi000/discord-vc-notify-bot?label=latest)](https://github.com/Skyzi000/discord-vc-notify-bot/pkgs/container/jmusicbot-jp-docker)
[![Docker Pulls](https://img.shields.io/docker/pulls/skyzi000/discord-vc-notify-bot)](https://hub.docker.com/r/skyzi000/discord-vc-notify-bot)
[![Last Commit](https://img.shields.io/github/last-commit/Skyzi000/discord-vc-notify-bot)](https://github.com/Skyzi000/discord-vc-notify-bot/commits)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Skyzi000/discord-vc-notify-bot/Docker)](https://github.com/Skyzi000/discord-vc-notify-bot/actions/workflows/docker-publish.yml)

![example](https://user-images.githubusercontent.com/38061609/141670525-01866d43-64ea-4114-b755-6ae15fd94fbb.png)

Discordのボイスチャンネルへの入室を通知するBot

## 特徴

- 超シンプル
- 常時起動が簡単
- 更新が簡単
- イメージサイズが非常に小さい(約43MB程度)！
- Dockerがわからなくても(多分)使える

## コマンド
コマンドはBotにメンションする形で入力します

### setnc [チャンネルID]
通知チャンネルを設定します。

![setnc-with-id](https://user-images.githubusercontent.com/38061609/141670434-28aa9e68-27e7-44cb-becc-52bbbf14acb5.png)

チャンネルIDを入力しない場合はこのコマンドを入力したチャンネルを通知チャンネルに設定します。
![setnc-without-id](https://user-images.githubusercontent.com/38061609/141670252-6b80b499-e229-447c-b7ab-80196cd0073f.png)

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

