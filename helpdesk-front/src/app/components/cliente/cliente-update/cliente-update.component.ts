import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cliente } from 'src/app/models/cliente';
import { ClienteService } from 'src/app/services/cliente.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-cliente-update',
  templateUrl: './cliente-update.component.html',
  styleUrls: ['./cliente-update.component.css']
})
export class ClienteUpdateComponent implements OnInit {
  cliente: Cliente = {
    id: '',
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    perfis: [] as number[],
    dataCriacao: ''
  };

  nome: FormControl = new FormControl(null, Validators.minLength(3));
  cpf: FormControl = new FormControl(null, Validators.required);
  email: FormControl = new FormControl(null, Validators.email);
  senha: FormControl = new FormControl(null, Validators.minLength(3));

  private readonly PERFIL_CLIENTE = 1; // Código do perfil Cliente

  constructor(
      private service: ClienteService,
      private toast: ToastrService,
      private router: Router,
      private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.cliente.id = this.route.snapshot.paramMap.get('id');
    this.findById();
  }

  findById(): void {
    this.service.findById(this.cliente.id).subscribe(resposta => {
      this.cliente = resposta;
      // Garantir que o perfil Cliente esteja sempre marcado por padrão
      if (!this.cliente.perfis.includes(this.PERFIL_CLIENTE)) {
        this.cliente.perfis.push(this.PERFIL_CLIENTE);
      }
    });
  }

  update(): void {
    this.service.update(this.cliente).subscribe(() => {
      this.toast.success('Cliente atualizado com sucesso', 'Update');
      this.router.navigate(['clientes']);
    }, ex => {
      if (ex.error.errors) {
        ex.error.errors.forEach(element => {
          this.toast.error(element.message);
        });
      } else {
        this.toast.error(ex.error.message);
      }
    });
  }

  addPerfil(perfil: number, event: MatCheckboxChange): void {
    if (perfil === this.PERFIL_CLIENTE) {
      this.toast.warning('Não é permitido alterar o perfil Cliente', 'Atenção');
      event.source.checked = true;
      return;
    }

    if (event.checked) {
      if (!this.cliente.perfis.includes(perfil)) {
        this.cliente.perfis.push(perfil);
      }
    } else {
      const index = this.cliente.perfis.indexOf(perfil);
      if (index !== -1) {
        this.cliente.perfis.splice(index, 1);
      }
    }
  }

  isPerfilChecked(perfil: number): boolean {
    return this.cliente.perfis.includes(perfil);
  }

  validaCampos(): boolean {
    return this.nome.valid && this.cpf.valid && this.email.valid && this.senha.valid;
  }
}
