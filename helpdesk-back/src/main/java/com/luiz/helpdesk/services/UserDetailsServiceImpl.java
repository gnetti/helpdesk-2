package com.luiz.helpdesk.services;

import com.luiz.helpdesk.domain.Pessoa;
import com.luiz.helpdesk.repositories.PessoaRepository;
import com.luiz.helpdesk.security.UserSS;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final PessoaRepository pessoaRepository;

    @Autowired
    public UserDetailsServiceImpl(PessoaRepository repository) {
        this.pessoaRepository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<Pessoa> user = pessoaRepository.findByEmail(email);
        if (user.isPresent()) {
            Pessoa pessoa = user.get();
            UserSS userSS = new UserSS(pessoa.getId(), pessoa.getEmail(), pessoa.getSenha(), pessoa.getPerfis(), pessoa.getNome(), pessoa.getTema());
            return userSS;
        } else {
            throw new UsernameNotFoundException(email);
        }
    }
}
