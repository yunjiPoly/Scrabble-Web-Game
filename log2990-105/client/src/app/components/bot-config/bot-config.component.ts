import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { BotName } from '@app/classes/game-info';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { BotConfigDialogComponent } from '@app/components/bot-config-dialog/bot-config-dialog.component';

export type DialogAction = 'add' | 'edit' | 'delete';
export type DialogResult = { confirmation: boolean; value: string };

@Component({
    selector: 'app-bot-config',
    templateUrl: './bot-config.component.html',
    styleUrls: ['../../styles.scss', '../../pages/admin-page/admin-page.component.scss', './bot-config.component.scss'],
    encapsulation: ViewEncapsulation.Emulated,
})
export class BotConfigComponent implements AfterViewInit {
    @Input() set data(data: BotName[]) {
        this.tableData.data = data;
        this.selection.clear();
    }
    @Input() difficulty: number;
    @Output() difficultyChange = new EventEmitter<number>();
    @Output() get = new EventEmitter<null>();
    @Output() add = new EventEmitter<string>();
    @Output() delete = new EventEmitter<string[]>();
    @Output() edit = new EventEmitter<Partial<BotName>>();
    @ViewChild(MatTable) table: MatTable<BotName>;

    readonly tableColumns: string[] = ['select', 'name', 'details', 'actions', 'id'];
    tableData = new MatTableDataSource<BotName>();
    selection = new SelectionModel<BotName>(true, []);

    constructor(public dialog: MatDialog) {}

    ngAfterViewInit(): void {
        this.getNames();
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.tableData.data.filter((bot) => !bot.default).length;
        return numSelected === numRows;
    }

    isToggleEnabled() {
        return this.tableData.data ? this.tableData.data.some((bot) => !bot.default) : false;
    }

    toggleAll() {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }
        this.selection.select(...this.tableData.data.filter((bot) => !bot.default));
    }

    getNames(): void {
        this.get.emit();
    }

    addName(name: string) {
        this.add.emit(name);
    }

    deleteName(ids: string[]) {
        this.delete.emit(ids);
    }

    editName(id: string, name: string) {
        this.edit.emit({ id, name });
    }

    openDialog(action: DialogAction, target?: Partial<BotName>, params?: Partial<BotName>[]) {
        const dialogRef = this.dialog.open(BotConfigDialogComponent, {
            data: { action, target, params },
        });
        dialogRef.afterClosed().subscribe((res: DialogResult) => {
            if (!res.confirmation) {
                return;
            }
            if (action === 'add') {
                this.addName(res.value);
            }
            if (action === 'delete') {
                this.deleteName((params as BotName[]).map((bot) => bot.id));
            }
            if (action === 'edit') {
                this.editName(target?.id as string, res.value);
            }
        });
    }
}
