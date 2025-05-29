#!/bin/bash

# 小红书笔记生成器 - 生产环境部署脚本
# 使用方法: ./deploy.sh [start|stop|restart|logs|status]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="xiaohongshu-generator"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要文件
check_requirements() {
    log_info "检查部署环境..."
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    # 检查配置文件
    if [ ! -f "$ENV_FILE" ]; then
        log_error "生产环境配置文件 $ENV_FILE 不存在"
        log_info "请复制 .env.prod.example 为 $ENV_FILE 并配置相应参数"
        exit 1
    fi
    
    # 检查 compose 文件
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Docker Compose 配置文件 $COMPOSE_FILE 不存在"
        exit 1
    fi
    
    log_success "环境检查通过"
}

# 启动服务
start_services() {
    log_info "启动生产环境服务..."
    
    # 构建并启动服务
    docker-compose -f "$COMPOSE_FILE" up -d --build
    
    log_success "服务启动完成"
    log_info "等待服务就绪..."
    sleep 10
    
    # 检查服务状态
    check_services_health
}

# 停止服务
stop_services() {
    log_info "停止生产环境服务..."
    docker-compose -f "$COMPOSE_FILE" down
    log_success "服务已停止"
}

# 重启服务
restart_services() {
    log_info "重启生产环境服务..."
    stop_services
    start_services
}

# 查看日志
show_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        log_info "显示 $service 服务日志..."
        docker-compose -f "$COMPOSE_FILE" logs -f "$service"
    else
        log_info "显示所有服务日志..."
        docker-compose -f "$COMPOSE_FILE" logs -f
    fi
}

# 检查服务健康状态
check_services_health() {
    log_info "检查服务健康状态..."
    
    # 检查数据库
    if docker-compose -f "$COMPOSE_FILE" exec -T db pg_isready -U postgres_admin > /dev/null 2>&1; then
        log_success "数据库服务正常"
    else
        log_warning "数据库服务异常"
    fi
    
    # 检查后端 API
    if curl -f http://localhost:8000/docs > /dev/null 2>&1; then
        log_success "后端 API 服务正常"
    else
        log_warning "后端 API 服务异常"
    fi
    
    # 检查前端
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "前端服务正常"
    else
        log_warning "前端服务异常"
    fi
}

# 显示服务状态
show_status() {
    log_info "服务运行状态:"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    check_services_health
}

# 备份数据
backup_data() {
    log_info "备份数据库..."
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose -f "$COMPOSE_FILE" exec -T db pg_dump -U postgres_admin postgres > "$backup_file"
    log_success "数据库备份完成: $backup_file"
}

# 更新服务
update_services() {
    log_info "更新服务..."
    
    # 备份数据
    backup_data
    
    # 拉取最新代码（如果是 git 仓库）
    if [ -d ".git" ]; then
        log_info "拉取最新代码..."
        git pull
    fi
    
    # 重新构建并启动
    docker-compose -f "$COMPOSE_FILE" up -d --build
    
    log_success "服务更新完成"
}

# 清理资源
cleanup() {
    log_info "清理未使用的 Docker 资源..."
    docker system prune -f
    docker volume prune -f
    log_success "清理完成"
}

# 显示帮助信息
show_help() {
    echo "小红书笔记生成器 - 生产环境部署脚本"
    echo ""
    echo "使用方法:"
    echo "  $0 [命令] [参数]"
    echo ""
    echo "可用命令:"
    echo "  start          启动所有服务"
    echo "  stop           停止所有服务"
    echo "  restart        重启所有服务"
    echo "  status         显示服务状态"
    echo "  logs [service] 显示日志 (可指定服务名)"
    echo "  backup         备份数据库"
    echo "  update         更新服务"
    echo "  cleanup        清理未使用的资源"
    echo "  help           显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 start                # 启动所有服务"
    echo "  $0 logs backend         # 查看后端服务日志"
    echo "  $0 status               # 查看服务状态"
}

# 主函数
main() {
    local command=${1:-"help"}
    
    case "$command" in
        "start")
            check_requirements
            start_services
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            check_requirements
            restart_services
            ;;
        "logs")
            show_logs "$2"
            ;;
        "status")
            show_status
            ;;
        "backup")
            backup_data
            ;;
        "update")
            check_requirements
            update_services
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# 执行主函数
main "$@" 