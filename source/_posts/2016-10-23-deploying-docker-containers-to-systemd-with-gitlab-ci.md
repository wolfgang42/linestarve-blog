---
layout: post
title: "Deploying Docker containers to systemd with GitLab CI"
date: 2016-10-23 12:00:00 -0400
tags: ["GitLab", "CI", "Docker", "systemd"]
---
```ini dockercontainer@.service
# unit to run any arbitrary Docker container
[Unit]
Description=%i
After=docker.service
Requires=docker.service

[Install]
WantedBy=multi-user.target

[Service]
TimeoutStartSec=0
ExecStart=/usr/bin/docker start -a %i
ExecStop=/usr/bin/docker stop %i
```

```bash deploy-image.sh
#!/bin/bash
set -e
set -u

DOCKER_IMAGE="$CI_REGISTRY_IMAGE:$CI_BUILD_REF_NAME"
DOCKER_CONTAINER=$(echo "$CI_PROJECT_NAME" | tr '[:upper:]' '[:lower:]')".$CI_BUILD_REF_NAME"

if docker inspect "$DOCKER_CONTAINER" 2>&1 > /dev/null; then
        if docker inspect "$DOCKER_CONTAINER.backup" 2>&1 > /dev/null; then
                echo "Deleting previous backup $DOCKER_CONTAINER.backup"
                docker rm "$DOCKER_CONTAINER.backup" > /dev/null
        fi
        echo "Backing up container $DOCKER_CONTAINER"
        sudo systemctl stop "dockercontainer@$DOCKER_CONTAINER"
        docker rename "$DOCKER_CONTAINER" "$DOCKER_CONTAINER.backup"
fi

docker pull "$DOCKER_IMAGE"
/usr/bin/docker create --name "$DOCKER_CONTAINER" "$DOCKER_IMAGE"

sudo systemctl start "dockercontainer@$DOCKER_CONTAINER"
sudo systemctl enable "dockercontainer@$DOCKER_CONTAINER"
```

```yaml .gitlab-ci.yml
stages:
  - publish
  - deploy

publish:
  stage: publish
  tags: [docker]
  script:
    - docker login -u gitlab-ci-token -p $CI_BUILD_TOKEN $CI_REGISTRY
    - docker build --pull -t $CI_REGISTRY_IMAGE:$CI_BUILD_REF_NAME .
    - docker push $CI_REGISTRY_IMAGE:$CI_BUILD_REF_NAME

deploy:
  stage: deploy
  environment: Live
  tags: [ssh-executor]
  variables: {GIT_STRATEGY: none}
  when: manual
  only: [master]
  script:
    - ~/Infrastructure-CoreOS/deploy-image.sh
```
