import * as fs from 'fs';
import * as readline from 'readline';
import { performance } from 'perf_hooks';

type FrequencyMap = Map<string, number>;


const processLine = (line: string, stats: FrequencyMap): void => {
  const words = line.toLowerCase().match(/[a-z0-9]+/g);
  
  if (words) {
    for (const word of words) {
      const count = stats.get(word) || 0;
      stats.set(word, count + 1);
    }
  }
};

const main = async (inputFileName: string, outputFileName: string) => {
  try {
    const startTime = performance.now();
    
    if (!fs.existsSync(inputFileName)) {
      console.error(`错误: 文件 ${inputFileName} 不存在`);
      return;
    }

    console.log(`开始处理大文件: ${inputFileName} (可能需要一些时间)...`);

    const fileStream = fs.createReadStream(inputFileName);
    
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const frequencyMap: FrequencyMap = new Map();
    let lineCount = 0;

    for await (const line of rl) {
      processLine(line, frequencyMap);
      lineCount++;
      
      // 每处理 10万行打印一次进度，避免焦虑
      if (lineCount % 100000 === 0) {
        // 打印当前内存占用 (MB)
        const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        console.log(`已处理 ${lineCount} 行... (当前堆内存: ${memUsage} MB)`);
      }
    }

    console.log(`文件读取完成，正在进行排序和写入...`);

    // 3. 排序 (Map 转数组 -> 排序)
    // 注意：如果 unique 单词量极大，这一步仍可能消耗较多内存
    const sortedEntries = Array.from(frequencyMap.entries()).sort(
      (a, b) => b[1] - a[1]
    );

    // 4. 使用流写入结果 (防止结果字符串过大撑爆内存)
    const writeStream = fs.createWriteStream(outputFileName, { encoding: 'utf-8' });
    
    for (const [word, count] of sortedEntries) {
      // 写入缓冲区如果满了，等待 drain 事件（背压处理）
      const overWatermark = !writeStream.write(`${word}: ${count}\n`);
      if (overWatermark) {
        await new Promise((resolve) => writeStream.once('drain', resolve));
      }
    }
    
    writeStream.end();

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2); // 秒

    console.log(`-----------------------------------`);
    console.log(`统计完成！`);
    console.log(`输出文件: ${outputFileName}`);
    console.log(`处理行数: ${lineCount}`);
    console.log(`独立单词数: ${frequencyMap.size}`);
    console.log(`总耗时: ${duration} s`);
    console.log(`-----------------------------------`);

  } catch (error) {
    console.error('发生错误:', error);
  }
};

// 运行
main('A.txt', 'Sta_A.txt');