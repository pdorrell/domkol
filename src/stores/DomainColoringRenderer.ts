import { makeAutoObservable } from 'mobx';

export class DomainColoringRenderer {
  showDomainColoring: boolean = true;
  colorScale: number = 1.0; // Default color scale
  repaintContinuously: boolean = true;
  
  constructor() {
    makeAutoObservable(this);
  }
  
  setShowDomainColoring(show: boolean): void {
    this.showDomainColoring = show;
  }
  
  setRepaintContinuously(repaint: boolean): void {
    this.repaintContinuously = repaint;
  }
  
  // Translated from original getColourScaleFromSliderValue function
  setColorScaleFromSlider(sliderValue: number): void {
    this.colorScale = 1.0 * Math.pow(1.2, sliderValue - 50);
  }
  
  setColorScale(scale: number): void {
    this.colorScale = Math.max(0.01, scale);
  }
  
  // Convert color scale back to slider value for UI
  get colorScaleSliderValue(): number {
    return Math.log(this.colorScale) / Math.log(1.2) + 50;
  }
}