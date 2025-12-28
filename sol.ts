import * as fs from 'fs';
import * as path from 'path'

type FrequencyMap = Record<string, number>;

/*
    Map函数：
    转小写-->正则去标点-->按空白分割-->过滤空串
*/
const mapWords = (content: string) : string[] => {
    return content
        .toLowerCase()
        .replace(/[^\w\s]|_/g, '')
        .split(/\s+/)
        .filter((word) => word.length > 0);
};

/*
    Reduce函数
*/

const reduceCounts = (words: string[]): FrequencyMap => {
    return words.reduce((acc,word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
    }, {} as FrequencyMap);
};

const main = (inputFileName: string, outputFileName: string) => {
    try{
        const inputPath = inputFileName;
        const outputPath = outputFileName;

        console.log(`正在读取文件：${inputFileName}...`);
        const rawText = fs.readFileSync(inputPath, 'utf-8');

        const wordList = mapWords(rawText);
        const FrequencyMap = reduceCounts(wordList);

        const sortedEntries = Object.entries(FrequencyMap).sort(
            (a,b) => b[1] - a[1]
        );

        const outputContent = sortedEntries
            .map(([word, count]) => `${word}: ${count}`)
            .join('\n');
            
        fs.writeFileSync(outputPath, outputContent, 'utf-8');
        console.log(`统计完成！结果已保存至: ${outputFileName}`);
    } catch (error){
        console.log('发生错误',error);
    }
}

main('A.txt', 'Sta_A.txt');
