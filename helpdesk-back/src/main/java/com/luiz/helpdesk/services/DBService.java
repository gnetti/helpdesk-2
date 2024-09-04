package com.luiz.helpdesk.services;

import com.luiz.helpdesk.domain.*;
import com.luiz.helpdesk.domain.enums.Perfil;
import com.luiz.helpdesk.domain.enums.Prioridade;
import com.luiz.helpdesk.domain.enums.Status;
import com.luiz.helpdesk.repositories.ChamadoRepository;
import com.luiz.helpdesk.repositories.ClienteRepository;
import com.luiz.helpdesk.repositories.ObservacaoRepository;
import com.luiz.helpdesk.repositories.TecnicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class DBService {

    private final ChamadoRepository chamadoRepository;
    private final TecnicoRepository tecnicoRepository;
    private final ClienteRepository clienteRepository;
    private final ObservacaoRepository observacaoRepository;
    private final BCryptPasswordEncoder encoder;

    @Autowired
    public DBService(ChamadoRepository chamadoRepository,
                     TecnicoRepository tecnicoRepository,
                     ClienteRepository clienteRepository,
                     ObservacaoRepository observacaoRepository,
                     BCryptPasswordEncoder encoder) {
        this.chamadoRepository = chamadoRepository;
        this.tecnicoRepository = tecnicoRepository;
        this.clienteRepository = clienteRepository;
        this.observacaoRepository = observacaoRepository;
        this.encoder = encoder;
    }

    public void instanciaDB() {

        Tecnico admin = new Tecnico(null, "Luiz Generoso", "220.905.407-96", "luiz@mail.com", encoder.encode("AdminPass@1234"));
        admin.addPerfil(Perfil.ADMIN);
        admin.setTema("pinkBluegrey");

        Endereco enderecoAdmin = new Endereco("01001-000", "SP", "São Paulo", "Praça da Sé", "100", "Centro", "Sala 101", admin);
        admin.setEndereco(enderecoAdmin);
        tecnicoRepository.save(admin);

        Cliente cliente1 = new Cliente(null, "Albert Einstein", "111.661.890-74", "einstein@mail.com", encoder.encode("c"));
        cliente1.setTema("indigoPink");
        Cliente cliente2 = new Cliente(null, "Marie Curie", "322.429.140-06", "curie@mail.com", encoder.encode("Password@1234"));
        cliente2.setTema("indigoPink");
        Cliente cliente3 = new Cliente(null, "Charles Darwin", "792.043.830-62", "darwin@mail.com", encoder.encode("Password@1234"));
        cliente3.setTema("indigoPink");
        Cliente cliente4 = new Cliente(null, "Stephen Hawking", "177.409.680-30", "hawking@mail.com", encoder.encode("Password@1234"));
        cliente4.setTema("indigoPink");
        Cliente cliente5 = new Cliente(null, "Max Planck", "081.399.300-83", "planck@mail.com", encoder.encode("Password@1234"));
        cliente5.setTema("indigoPink");

        Tecnico tecnico1 = new Tecnico(null, "john wick", "550.482.150-95", "john@mail.com", encoder.encode("Password@1234"));
        tecnico1.addPerfil(Perfil.ADMIN);
        tecnico1.setTema("indigoPink");
        Tecnico tecnico2 = new Tecnico(null, "Richard Stallman", "903.347.070-56", "stallman@mail.com", encoder.encode("Password@1234"));
        tecnico2.setTema("indigoPink");
        Tecnico tecnico3 = new Tecnico(null, "Claude Elwood Shannon", "271.068.470-54", "shannon@mail.com", encoder.encode("Password@1234"));
        tecnico3.setTema("indigoPink");
        Tecnico tecnico4 = new Tecnico(null, "Tim Berners-Lee", "162.720.120-39", "lee@mail.com", encoder.encode("Password@1234"));
        tecnico4.setTema("indigoPink");
        Tecnico tecnico5 = new Tecnico(null, "Linus Torvalds", "778.556.170-27", "linus@mail.com", encoder.encode("Password@1234"));
        tecnico5.setTema("indigoPink");

        Endereco endereco1 = new Endereco("12345-678", "SP", "São Paulo", "Rua das Flores", "123", "Jardim das Rosas", "Apto 45", cliente1);
        Endereco endereco2 = new Endereco("23456-789", "RJ", "Rio de Janeiro", "Av. das Américas", "456", "Barra da Tijuca", "Bloco 10", cliente2);
        Endereco endereco3 = new Endereco("34567-890", "MG", "Belo Horizonte", "Av. Afonso Pena", "789", "Centro", "Sala 10", cliente3);
        Endereco endereco4 = new Endereco("45678-901", "BA", "Salvador", "Rua do Sodré", "101", "Centro", "Apto 202", cliente4);
        Endereco endereco5 = new Endereco("56789-012", "RS", "Porto Alegre", "Rua dos Andradas", "202", "Centro Histórico", "Apto 303", cliente5);

        cliente1.setEndereco(endereco1);
        cliente2.setEndereco(endereco2);
        cliente3.setEndereco(endereco3);
        cliente4.setEndereco(endereco4);
        cliente5.setEndereco(endereco5);

        Endereco endereco6 = new Endereco("67890-123", "SP", "São Paulo", "Rua das Palmeiras", "654", "Jardim das Palmeiras", "Sala 101", tecnico1);
        Endereco endereco7 = new Endereco("78901-234", "RJ", "Rio de Janeiro", "Av. das Nações", "321", "Barra da Tijuca", "Sala 202", tecnico2);
        Endereco endereco8 = new Endereco("89012-345", "MG", "Belo Horizonte", "Rua dos Carvalhos", "987", "Centro", "Sala 303", tecnico3);
        Endereco endereco9 = new Endereco("90123-456", "BA", "Salvador", "Rua da Liberdade", "123", "Centro", "Sala 404", tecnico4);
        Endereco endereco10 = new Endereco("01234-567", "RS", "Porto Alegre", "Rua das Hortênsias", "456", "Centro Histórico", "Sala 505", tecnico5);

        tecnico1.setEndereco(endereco6);
        tecnico2.setEndereco(endereco7);
        tecnico3.setEndereco(endereco8);
        tecnico4.setEndereco(endereco9);
        tecnico5.setEndereco(endereco10);

        List<Tecnico> tecnicos = Arrays.asList(tecnico1, tecnico2, tecnico3, tecnico4, tecnico5);
        tecnicos.forEach(tec -> tec.addPerfil(Perfil.TECNICO));
        tecnicoRepository.saveAll(tecnicos);

        List<Cliente> clientes = Arrays.asList(cliente1, cliente2, cliente3, cliente4, cliente5);
        clientes.forEach(cli -> cli.addPerfil(Perfil.CLIENTE));
        clienteRepository.saveAll(clientes);

        List<Chamado> chamados = Arrays.asList(
                new Chamado(null, Prioridade.MEDIA, Status.EM_ANDAMENTO, "Chamado 1", null, tecnico1, cliente1),
                new Chamado(null, Prioridade.ALTA, Status.EM_ABERTO, "Chamado 2", null, tecnico1, cliente2),
                new Chamado(null, Prioridade.BAIXA, Status.ENCERRADO, "Chamado 3", null, tecnico2, cliente3),
                new Chamado(null, Prioridade.ALTA, Status.EM_ABERTO, "Chamado 4", null, tecnico3, cliente3),
                new Chamado(null, Prioridade.MEDIA, Status.EM_ANDAMENTO, "Chamado 5", null, tecnico2, cliente1),
                new Chamado(null, Prioridade.BAIXA, Status.ENCERRADO, "Chamado 6", null, tecnico1, cliente5)
        );
        chamadoRepository.saveAll(chamados);

        List<Observacao> observacoes = Arrays.asList(
                new Observacao("15/07/2024 10:00:00", "Observação 1 para Chamado 1", chamados.get(0), Status.EM_ANDAMENTO.getCodigo(), tecnico1.getId(), tecnico1.getNome()),
                new Observacao("15/07/2024 11:00:00", "Observação 2 para Chamado 1", chamados.get(0), Status.EM_ANDAMENTO.getCodigo(), tecnico1.getId(), tecnico1.getNome()),
                new Observacao("15/07/2024 12:00:00", "Observação 1 para Chamado 2", chamados.get(1), Status.EM_ABERTO.getCodigo(), tecnico1.getId(), tecnico1.getNome()),
                new Observacao("15/07/2024 13:00:00", "Observação 1 para Chamado 3", chamados.get(2), Status.ENCERRADO.getCodigo(), tecnico2.getId(), tecnico2.getNome()),
                new Observacao("15/07/2024 14:00:00", "Observação 2 para Chamado 3", chamados.get(2), Status.ENCERRADO.getCodigo(), tecnico2.getId(), tecnico2.getNome())
        );
        observacaoRepository.saveAll(observacoes);
    }
}
