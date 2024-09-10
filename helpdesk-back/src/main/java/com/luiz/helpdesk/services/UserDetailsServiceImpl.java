package com.luiz.helpdesk.services;

import com.luiz.helpdesk.domain.Pessoa;
import com.luiz.helpdesk.repositories.PessoaRepository;
import com.luiz.helpdesk.security.UserSS;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final PessoaRepository pessoaRepository;

    @Autowired
    public UserDetailsServiceImpl(PessoaRepository repository) {
        this.pessoaRepository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return pessoaRepository.findByEmail(email)
                .map(this::createUserSS)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + email));
    }

    private UserSS createUserSS(Pessoa pessoa) {
        return new UserSS(
                pessoa.getId(),
                pessoa.getEmail(),
                pessoa.getSenha(),
                pessoa.getPerfis(),
                pessoa.getNome(),
                pessoa.getTema()
        );
    }
}
