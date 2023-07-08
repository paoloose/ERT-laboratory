#!/bin/bash

# Run the rabbitmq docker container

set -e

container_name="ert_cloud_rabbitmq"
rabbitmq_image="rabbitmq:3-management" # :3
docker_flags="-d"
hostname="rmq"

# container is runnig
if [ -n "$(docker ps -q -f name=$container_name)" ]; then
    echo "Restarting $container_name"
    docker stop $container_name
    docker rm $container_name
fi

echo "Starting $container_name"

docker run $docker_flags \
    --hostname $hostname \
    --name $container_name \
    -p 8080:15672 -p 5672:5672 \
    $rabbitmq_image
