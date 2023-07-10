import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsvExportService {

  constructor() { }

  exportToCsv(data: any[], filename: string): void {
    const csvContent = this.convertArrayToCsv(data);
    this.downloadCsv(csvContent, filename);
  }

  private convertArrayToCsv(data: any[]): string {
    const csvRows = [];
    const keys = this.extractKeys(data[0]);

    csvRows.push(keys.join(','));

    for (const item of data) {
      const values = keys.map(key => {
        const propertyValue = this.getPropertyValue(item, key);
        return this.escapeCsvValue(propertyValue);
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  private extractKeys(obj: any): string[] {
    const keys = [];

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value !== 'object' || value === null) {
          keys.push(key);
        } else {
          const nestedKeys = this.extractKeys(value);
          keys.push(...nestedKeys.map(nestedKey => `${key}.${nestedKey}`));
        }
      }
    }

    return keys;
  }

  private getPropertyValue(obj: any, key: string): any {
    const nestedKeys = key.split('.');
    let value = obj;

    for (const nestedKey of nestedKeys) {
      if (value && value[nestedKey] !== undefined) {
        value = value[nestedKey];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private escapeCsvValue(value: any): string {
    if (typeof value === 'string') {
      // Escape quotes and wrap the value in quotes if it contains special characters
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
    }
    return String(value);
  }

  private downloadCsv(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Creating a temporary link element to trigger the download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);

    // Simulating a click on the link to start the download
    link.click();

    // Cleaning up the temporary link
    URL.revokeObjectURL(url);
    link.remove();
  }
}

// export class CsvExportService {

//   constructor() { }

//   exportToCsv(data: any[], filename: string): void {
//     const csvContent = this.convertArrayToCsv(data);
//     this.downloadCsv(csvContent, filename);
//   }

//   // private convertArrayToCsv(data: any[]): string {
//   //   const csvRows = [];

//   //   // Extracting keys from the first object in the data array
//   //   const keys = Object.keys(data[0]);

//   //   // Pushing the headers as the first row
//   //   csvRows.push(keys.join(','));

//   //   // Looping over the data and converting objects to CSV rows
//   //   for (const item of data) {
//   //     const values = keys.map(key => this.escapeCsvValue(item[key]));
//   //     csvRows.push(values.join(','));
//   //   }

//   //   return csvRows.join('\n');
//   // }
//   private convertArrayToCsv(data: any[]): string {
//     const csvRows = [];
//     const keys = Object.keys(data[0]);
  
//     csvRows.push(keys.join(','));
  
//     for (const item of data) {
//       const values = keys.map(key => {
//         const propertyValue = this.getPropertyValue(item, key);
//         return this.escapeCsvValue(propertyValue);
//       });
//       csvRows.push(values.join(','));
//     }
  
//     return csvRows.join('\n');
//   }
  
//   private getPropertyValue(obj: any, key: string): any {
//     const nestedKeys = key.split('.');
//     let value = obj;
  
//     for (const nestedKey of nestedKeys) {
//       if (value && value[nestedKey] !== undefined) {
//         value = value[nestedKey];
//       } else {
//         return undefined;
//       }
//     }
  
//     return value;
//   }

//   private escapeCsvValue(value: any): string {
//     if (typeof value === 'string') {
//       // Escape quotes and wrap the value in quotes if it contains special characters
//       if (value.includes(',') || value.includes('"') || value.includes('\n')) {
//         return `"${value.replace(/"/g, '""')}"`;
//       }
//     }
//     return String(value);
//   }

//   private downloadCsv(csvContent: string, filename: string): void {
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);

//     // Creating a temporary link element to trigger the download
//     const link = document.createElement('a');
//     link.setAttribute('href', url);
//     link.setAttribute('download', filename);

//     // Simulating a click on the link to start the download
//     link.click();

//     // Cleaning up the temporary link
//     URL.revokeObjectURL(url);
//     link.remove();
//   }
// }