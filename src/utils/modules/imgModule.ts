import { AttachmentBuilder } from 'discord.js';
import Canvas from 'canvas';

export default class CreateImage {
  private data: any;
  constructor() {
    this.data = {
      text: '',
      image: '',
      x: 0,
      y: 0,
      text_options: {
        max_text_size: 0,
        line_height: 0,
      },
      rect: {
        fill_color: '',
        x_difference: 0,
        y_difference: 0,
        width: 0,
        height: 0,
      },
    };
  }
  /**
   * setup the text string and it's coordinates
   * @param {string} txt the string of text
   * @param {number} maxTextSize the max width of the text
   * @param {number} lineHeight the height between lines
   * @returns
   */
  setText(txt: string, maxTextSize: number, lineHeight: number) {
    this.data.text = txt;
    this.data.text_options = {
      max_text_size: maxTextSize,
      line_height: lineHeight,
    };
    return this;
  }
  setImage(img: string) {
    this.data.image = img;
    return this;
  }
  setX(x: number) {
    this.data.x = x;
    return this;
  }
  setY(y: number) {
    this.data.y = y;
    return this;
  }
  /** set rect data
   * @param {string} color The color of the rect
   * @param {number} x difference between the canvas' x axis and the rect's
   * @param {number} y difference between the canvas' y axis and the rect's
   * @param {number} width rect's width
   * @param {number} height rect's height
   */
  setRect(color: string, x: number, y: number, width: number, height: number) {
    //idk why but i want each to be in a single line
    this.data.rect.fill_color = color;
    this.data.rect.x_difference = x;
    this.data.rect.y_difference = y;
    this.data.rect.width = width;
    this.data.rect.height = height;
    return this;
  }
  async create() {
    const text = this.data.text;
    const txtOptions = this.data.text_options;
    const img = this.data.image;
    //x-axis coordinates
    const x = this.data.x;
    //y-axis coordinates
    const y = this.data.y;
    const rect = this.data.rect;
    const canvas = Canvas.createCanvas(320, 320);
    const ctx = canvas.getContext('2d');

    //filling a rectangle behind the text
    ctx.fillStyle = `${rect.fill_color}`;
    ctx.fillRect(
      x - rect.x_difference,
      y - rect.y_difference,
      rect.width,
      rect.height,
    );
    //drawing the image and putting the text
    ctx.font = `bold 18px sans`;
    ctx.fillStyle = `#2c3847`;
    wrapText(ctx, text, x, y, txtOptions.max_text_size, txtOptions.line_height);

    const image = await Canvas.loadImage(img);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const file = new AttachmentBuilder(canvas.toBuffer()).setName('img.png');

    return file;
  }
}

//the wrap function (didn't know how to make it so i had to get one...)
function wrapText(
  ctx: Canvas.CanvasRenderingContext2D,
  txt: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = txt.split(' ');
  let line: string = '';
  for (const [index, w] of words.entries()) {
    const testLine = line + w + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && index > 0) {
      ctx.fillText(line, x, y);
      line = w + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(
    line.slice(0, txt.length >= 300 ? 290 - txt.length : txt.length),
    x,
    y,
  );
}
