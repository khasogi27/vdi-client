import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';

import { Item } from '../../shared/interfaces/item';
import { ItemService } from '../../shared/services/item.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CommonModule, formatDate } from '@angular/common';

import { jsPDF } from "jspdf";

const MATERIALS: any[] = [
  MatCardModule,
  MatTableModule,
  MatButtonModule,
  MatIconModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatDatepickerModule,
  MatCheckboxModule,
  MatSelectModule
];

const MODULES: any[] = [
  FormsModule,
  ReactiveFormsModule,
  CommonModule
];


@Component({
  selector: 'app-item',
  standalone: true,
  imports: [...MODULES, ...MATERIALS],
  providers: [provideNativeDateAdapter()],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss'
})
export class ItemComponent implements OnInit  {

  displayedColumns: string[] = ['select', 'id', 'name', 'date'];
  dataSource: Item[] = [];
  filterData: Item[] = [];
  form: FormGroup = new FormGroup({
    name: new FormControl(),
    date: new FormControl()
  });
  rowSelected: Item | null = null;
  filterField: string = '';
  filterValue: string = '';

  private _itemSvc = inject(ItemService);
  private _dialog = inject(MatDialog);

  constructor() {}

  ngOnInit(): void {
    this._loadServer();
  }

  private _loadServer() {
    this._itemSvc.getAllItem().subscribe(resp => {
      this.dataSource = resp;
      this.filterData = this.dataSource;
    });
  }

  applyFilter() {
    const filterValueLower = this.filterValue.toLowerCase();
    this.filterData = this.dataSource.filter((item: any) => {
      return item[this.filterField].toString().toLowerCase().includes(filterValueLower);
    })
  }

  onCheckboxChange(element: Item) {
    this.rowSelected = element.selected ? element : null;
    this.filterData.forEach(item => {
      if (item !== element) item.selected = false;
    });
  }

  onAdd(tempRef: TemplateRef<any>) {
    if (this.rowSelected) return; 
    this._dialog.open(tempRef);
  }

  onUpdate(tempRef: TemplateRef<any>) {
    if (!this.rowSelected) return;
    this.form.patchValue(this.rowSelected);
    this._dialog.open(tempRef);
  }

  onDelete() {
    if (!this.rowSelected) return;
    const id = this.rowSelected.id;
    this._itemSvc.delete(id).subscribe(_ => {
      this._loadServer();
      this.rowSelected = null;
    });
  }

  exportPfd() {
    const doc = new jsPDF();

    doc.text("User Data", 10, 10);
    let y = 20;
    this.dataSource.forEach((item: Item) => {
      doc.text(`ID: ${item.id}, Name: ${item.name}, Date: ${item.date}`, 10, y);
      y += 10;
    });
    doc.save("items.pdf");
  }

  onCancel() {
    this.form.reset();
    this._dialog.closeAll();
  }

  onSubmit() {
    let getDate = this.form.get('date')?.value;
    getDate = formatDate(getDate, 'yyyy-MM-dd', 'en');
    this.form.controls['date'].setValue(getDate);
    const form = this.form.value;

    if (!this.rowSelected) {
      this._itemSvc.addItem(form).subscribe(_ => {
        this._loadServer();
        this.onCancel();
      });
      return;
    }

    const id = this.rowSelected.id;
    this._itemSvc.updateItem(id, form).subscribe(_ => {
      this._loadServer();
      this.onCancel();
      this.rowSelected = null;
    });
  }

}
