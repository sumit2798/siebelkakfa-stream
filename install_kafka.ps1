$ErrorActionPreference = "Stop"

$kafkaUrl = "https://archive.apache.org/dist/kafka/3.6.1/kafka_2.13-3.6.1.tgz"
$destDir = "d:\"
$kafkaDirName = "kafka_2.13-3.6.1"
$fullKafkaPath = Join-Path $destDir $kafkaDirName
$tempFile = "d:\kafka.tgz"

Write-Host "Downloading Kafka from $kafkaUrl..."
Invoke-WebRequest -Uri $kafkaUrl -OutFile $tempFile

Write-Host "Extracting Kafka..."
# Windows 10/11 tar supports .tgz
tar -xvzf $tempFile -C $destDir

Write-Host "Cleaning up..."
Remove-Item $tempFile -Force

Write-Host "Kafka installed at $fullKafkaPath"
Get-ChildItem $fullKafkaPath
