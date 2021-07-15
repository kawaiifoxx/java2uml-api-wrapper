#!/usr/bin/env bash

if ! [ -x "$(command -v apt)" ]; then
  echo 'Error: apt is not installed.' >&2
  exit 1
fi

if ! [ -x "$(command -v java)" ]; then
  echo 'info: Installing JDK' >&1

  # Install JDK 11 to run Java2UML Server.
  sudo apt-get install openjdk-11-jdk
fi

if ! [ -x "$(command -v node)" ]; then
  echo 'info: Installing node' >&1

  # Install node to run tests
  sudo apt install nodejs
fi

if ! [ -x "$(command -v npm)" ]; then
  echo 'info: Installing npm' >&1

  # Install npm to download dependencies
  sudo apt install npm
fi

# Run Java2UML
java -jar test/testSources/java2uml-1.1.1.jar

# Run npm tests.
npm test


