# Скрипт для настройки JDK на Windows
# Запустите этот скрипт ОТ ИМЕНИ АДМИНИСТРАТОРА

param(
    [Parameter(Mandatory=$true)]
    [string]$JdkPath
)

# Проверка прав администратора
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ОШИБКА: Этот скрипт должен быть запущен от имени администратора!" -ForegroundColor Red
    Write-Host "Щелкните правой кнопкой на PowerShell и выберите 'Запуск от имени администратора'" -ForegroundColor Yellow
    exit 1
}

# Проверка существования пути
if (-not (Test-Path $JdkPath)) {
    Write-Host "ОШИБКА: Путь '$JdkPath' не существует!" -ForegroundColor Red
    exit 1
}

# Проверка наличия bin/java.exe
$javaExe = Join-Path $JdkPath "bin\java.exe"
if (-not (Test-Path $javaExe)) {
    Write-Host "ОШИБКА: В указанной папке не найден JDK (нет файла bin\java.exe)!" -ForegroundColor Red
    Write-Host "Убедитесь, что вы указали путь к корневой папке JDK (например, C:\Java\jdk-17)" -ForegroundColor Yellow
    exit 1
}

Write-Host "Настройка JDK..." -ForegroundColor Green
Write-Host "Путь к JDK: $JdkPath" -ForegroundColor Cyan

# Установка JAVA_HOME
try {
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $JdkPath, [System.EnvironmentVariableTarget]::Machine)
    Write-Host "✓ JAVA_HOME установлен: $JdkPath" -ForegroundColor Green
} catch {
    Write-Host "ОШИБКА при установке JAVA_HOME: $_" -ForegroundColor Red
    exit 1
}

# Добавление в PATH
try {
    $currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::Machine)
    $binPath = Join-Path $JdkPath "bin"
    
    # Проверка, не добавлен ли уже путь
    if ($currentPath -notlike "*$binPath*") {
        $newPath = "$binPath;$currentPath"
        [System.Environment]::SetEnvironmentVariable("Path", $newPath, [System.EnvironmentVariableTarget]::Machine)
        Write-Host "✓ Путь добавлен в PATH: $binPath" -ForegroundColor Green
    } else {
        Write-Host "✓ Путь уже присутствует в PATH" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ОШИБКА при добавлении в PATH: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nУстановка завершена успешно!" -ForegroundColor Green
Write-Host "`nВАЖНО: Перезапустите все окна терминала и IDE для применения изменений." -ForegroundColor Yellow
Write-Host "`nДля проверки выполните в новом терминале:" -ForegroundColor Cyan
Write-Host "  java -version" -ForegroundColor White
Write-Host "  javac -version" -ForegroundColor White
Write-Host "  echo `$env:JAVA_HOME" -ForegroundColor White







