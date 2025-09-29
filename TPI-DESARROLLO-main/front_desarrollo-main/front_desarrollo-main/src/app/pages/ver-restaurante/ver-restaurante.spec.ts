import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerRestauranteComponent } from './ver-restaurante.component';


describe('VerRestaurante', () => {
  let component: VerRestauranteComponent;
  let fixture: ComponentFixture<VerRestauranteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerRestauranteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerRestauranteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
