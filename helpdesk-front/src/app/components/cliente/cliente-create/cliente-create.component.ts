import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {Cliente} from 'src/app/models/cliente';
import {ClienteService} from 'src/app/services/cliente.service';
import {MatCheckboxChange} from '@angular/material/checkbox';

@Component({
    selector: 'app-cliente-create',
    templateUrl: './cliente-create.component.html',
    styleUrls: ['./cliente-create.component.css']
})
export class ClienteCreateComponent implements OnInit {

    cliente: Cliente = {
        id: '',
        nome: '',
        cpf: '',
        email: '',
        senha: '',
        perfis: [1],
        dataCriacao: ''
    }

    nome: FormControl = new FormControl(null, Validators.minLength(3));
    cpf: FormControl = new FormControl(null, Validators.required);
    email: FormControl = new FormControl(null, Validators.email);
    senha: FormControl = new FormControl(null, Validators.minLength(3));

    constructor(
        private service: ClienteService,
        private toast: ToastrService,
        private router: Router,
    ) {
    }

    ngOnInit(): void {
    }

    create(): void {
        this.service.create(this.cliente).subscribe(() => {
            this.toast.success('Cliente cadastrado com sucesso', 'Cadastro');
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
        if (perfil === 1) {
            this.toast.warning('O perfil "Cliente" não pode ser removido.', 'Atenção');
            event.source.checked = true;
        } else {
            const index = this.cliente.perfis.indexOf(perfil);
            if (index !== -1) {
                this.cliente.perfis.splice(index, 1);
            } else {
                this.cliente.perfis.push(perfil);
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
