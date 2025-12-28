import * as fs from 'fs';
import { performance } from 'perf_hooks'; 

type FrequencyMap = Record<string, number>;

const mapWords = (content: string): string[] => {
  return content
    .toLowerCase()
    .replace(/[^\w\s]|_/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 0);
};

const reduceCounts = (words: string[]): FrequencyMap => {
  return words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as FrequencyMap);
};

const main = (inputFileName: string, outputFileName: string) => {
  try {
    
    const startTime = performance.now();

    console.log(`正在读取文件: ${inputFileName}...`);
    const rawText = fs.readFileSync(inputFileName, 'utf-8');

    const wordList = mapWords(rawText);
    const frequencyMap = reduceCounts(wordList);

    const sortedEntries = Object.entries(frequencyMap).sort(
      (a, b) => b[1] - a[1]
    );

    const outputContent = sortedEntries
      .map(([word, count]) => `${word}: ${count}`)
      .join('\n');

    fs.writeFileSync(outputFileName, outputContent, 'utf-8');

    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2); 

    console.log(`统计完成！结果已保存至: ${outputFileName}`);
    console.log(`>> 总耗时: ${duration} ms`); 

  } catch (error) {
    console.error('发生错误:', error);
  }
};

main('A.txt', 'Sta_A.txt');