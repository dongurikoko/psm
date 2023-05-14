import * as fs from 'fs';
import csv from 'csv-parser';

const tooexpensive_rate: number[] = [];
const tooexpensive: number[] = [];
const expensive_rate: number[] = [];
const expensive: number[] = [];
const toocheap_rate:number[] = [];
const toocheap:number[] = [];
const cheap_rate:number[] = [];
const cheap:number[] = [];


//csvデータを格納する二次元配列
const dataArray: any[][] = [];

//何円単位で集計するか
const unit:number = 50;

//2直線の交点のx座標を求める関数
const calc = (x1: number,x2:number,y1:number,y2:number,y3:number,y4:number) =>{
    return ((y3-y1)*(x1-x2)*(x1-x2) + x1*(y1-y2)*(x1-x2) - x1*(y3-y4)*(x1-x2)) / ((y1-y2)*(x1-x2) - (x1-x2)*(y3-y4));
};

//それぞれの価格を求める
const calcprice = (row_rate:number[],high_rate:number[]) => {
    let price: number = 0;

    for(let i=unit;i<=600-unit;i=i+unit){
        const a:number = row_rate[i]-high_rate[i];
        const b:number = row_rate[i+unit]-high_rate[i+unit];
    
        if(a * b <= 0){
            price = calc(i,i+unit,high_rate[i],high_rate[i+unit],
                                row_rate[i],row_rate[i+unit]);
        break;  
        }
    }

    return price;
};


fs.createReadStream('PSMrawdata.csv')
  .pipe(csv({ separator: ',' }))
  .on('data', (row: any) => {
    const rowData: any[] = Object.values(row).map((value: any) => parseInt(value as string));
    dataArray.push(rowData);
  })
  .on('end', () => { //データの読み込み完了後
    
    const size: number = dataArray.length;

    //"高い"の割合を求める
    for (let i = 0; i < size; i++) {
        expensive[i] = dataArray[i][1];
    }

    for(let i=unit;i<=600;i=i+unit){
        const count: number[] = expensive.filter((number) =>{
            return number <= i;
        });

        expensive_rate[i] = count.length / size * 100;
        //console.log(expensive_rate[i]);
    }

    //"高すぎて買えない"の割合を求める
    for (let i = 0; i < size; i++) {
        tooexpensive[i] = dataArray[i][3];
    }

    for(let i=unit;i<=600;i=i+unit){
        const count: number[] = tooexpensive.filter((number) =>{
            return number <= i;
        });

        tooexpensive_rate[i] = count.length / size * 100;
        //console.log(tooexpensive_rate[i]);
    }

    //"安い"の割合を求める
    for (let i = 0; i < size; i++) {
        cheap[i] = dataArray[i][2];
    }
    for(let i=unit;i<=600;i=i+unit){
        const count: number[] = cheap.filter((number) =>{
            return number >= i;
        });

        cheap_rate[i] = count.length / size * 100;
        //console.log(cheap_rate[i]);
    }

    //"安すぎて買わない"の割合を求める
    for (let i = 0; i < size; i++) {
        toocheap[i] = dataArray[i][4];
    }
    for(let i=unit;i<=600;i=i+unit){
        const count: number[] = toocheap.filter((number) =>{
            return number >= i;
        });

        toocheap_rate[i] = count.length / size * 100;
        //console.log(toocheap_rate[i]);
    }

    //最高価格の出力
    console.log(`最高価格:${Math.ceil((calcprice(cheap_rate,tooexpensive_rate)))}円`);

    //妥協価格の出力
    console.log(`妥協価格:${Math.ceil(calcprice(cheap_rate,expensive_rate))}円`);

    //理想価格の出力
    console.log(`理想価格:${Math.ceil(calcprice(toocheap_rate,tooexpensive_rate))}円`);

    //最低品質保証価格の出力
    console.log(`最低品質保証価格:${Math.ceil(calcprice(toocheap_rate,expensive_rate))}円`);
    
});
    
