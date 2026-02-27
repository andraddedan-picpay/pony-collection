import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@core/layout/main-layout/main-layout.component';
import { FeedbackComponent } from '@shared/components/feedback/feedback.component';

import { PonyService } from '../../services/pony.service';
import { Pony } from '../../models/pony.model';
import { DataStateEnum } from '@core/models/data-state.enum';
import { SvgIconComponent } from 'angular-svg-icon';
import { CreatePonyComponent } from '../../components/create-pony/create-pony.component';
import { PonyCardComponent } from '../../components/pony-card/pony-card.component';

@Component({
    selector: 'app-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MainLayoutComponent,
        FeedbackComponent,
        SvgIconComponent,
        CreatePonyComponent,
        PonyCardComponent,
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
    filter = signal('');

    isLoading = signal(false);
    hasError = signal(false);
    ponyList = signal<Pony[]>([]);

    public readonly DataStateEnum = DataStateEnum;

    filteredPonyList = computed(() => {
        const filterValue = this.filter().toLowerCase().trim();
        if (!filterValue) return this.ponyList();

        return this.ponyList().filter((pony) =>
            pony.name.toLowerCase().includes(filterValue),
        );
    });

    state = computed<DataStateEnum>(() => {
        if (this.isLoading()) return DataStateEnum.LOADING;
        if (this.hasError()) return DataStateEnum.ERROR;
        if (this.filteredPonyList().length === 0) return DataStateEnum.EMPTY;
        return DataStateEnum.SUCCESS;
    });

    private ponyService = inject(PonyService);

    ngOnInit(): void {
        this.getData();
    }

    updateFilter(value: string): void {
        this.filter.set(value);
    }

    getData(): void {
        this.isLoading.set(true);
        this.hasError.set(false);

        this.ponyService.getPonyList().subscribe({
            next: (ponies: Pony[]) => {
                this.ponyList.set(ponies);
                this.isLoading.set(false);
            },
            error: () => {
                this.hasError.set(true);
                this.isLoading.set(false);
            },
        });
    }
}
