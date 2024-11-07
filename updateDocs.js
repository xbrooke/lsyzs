const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');  // 引入 chokidar

// 获取 docs 目录的路径
const docsDir = path.join(__dirname, 'docs');  // 假设你的文档在 docs 目录下
const configPath = path.join(__dirname, 'config.json');  // 配置文件路径

// 读取现有的配置文件
function readConfig() {
    try {
        const data = fs.readFileSync(configPath, 'utf8');  // 读取配置文件
        return JSON.parse(data);  // 将 JSON 内容转为 JavaScript 对象
    } catch (err) {
        console.error('读取配置文件失败:', err);
        return { docs: [] };  // 如果配置文件读取失败，返回一个空的 docs 数组
    }
}

// 将新的配置写入 config.json 文件
function writeConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');  // 写入文件，格式化为 4 个空格缩进
        console.log('配置文件已更新');
    } catch (err) {
        console.error('写入配置文件失败:', err);
    }
}

// 扫描 docs 目录并更新配置文件
function updateDocs() {
    const config = readConfig();  // 读取当前的配置
    const docs = config.docs || [];  // 获取 docs 数组，默认空数组

    // 读取 docs 目录下的所有文件
    const files = fs.readdirSync(docsDir);

    // 过滤出所有 .html 文件并生成文档的元数据
    const newDocs = files.filter(file => file.endsWith('.html')).map(file => {
        return {
            title: file.replace('.html', ''),  // 使用文件名作为文档的标题
            file: file  // 文件名作为文件路径
        };
    });

    // 去除已存在文档，避免重复添加
    const existingDocs = docs.map(doc => doc.file);  // 获取现有文档的文件名
    const uniqueNewDocs = newDocs.filter(newDoc => !existingDocs.includes(newDoc.file));  // 只添加不存在的文档

    // 合并现有文档和新文档并去重
    const updatedDocs = [...docs, ...uniqueNewDocs];

    // 更新配置中的 docs 数组
    config.docs = updatedDocs;

    // 将更新后的配置写回 config.json
    writeConfig(config);
}

// 使用 chokidar 监视 docs 目录的变化
function watchDocs() {
    chokidar.watch(docsDir, { persistent: true })  // 监视 docs 目录
        .on('add', (path) => {
            console.log(`文件已添加: ${path}`);
            updateDocs();  // 文件添加时自动更新配置文件
        })
        .on('change', (path) => {
            console.log(`文件已修改: ${path}`);
            updateDocs();  // 文件修改时自动更新配置文件
        })
        .on('unlink', (path) => {
            console.log(`文件已删除: ${path}`);
            updateDocs();  // 文件删除时自动更新配置文件
        });
}

// 启动文件监视
watchDocs();

// 执行初始文档更新
updateDocs();
