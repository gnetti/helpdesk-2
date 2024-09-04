package com.luiz.helpdesk.resources;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.luiz.helpdesk.domain.Cliente;
import com.luiz.helpdesk.domain.dtos.ClienteDTO;
import com.luiz.helpdesk.services.ClienteService;

@RestController
@RequestMapping(value = "/clientes")
public class ClienteResource {

	@Autowired
	private ClienteService clienteService;

	@GetMapping(value = "/{id}")
	public ResponseEntity<ClienteDTO> findDTOById(@PathVariable Integer id) {
		ClienteDTO clienteDTO = clienteService.findDTOById(id);
		return ResponseEntity.ok().body(clienteDTO);
	}

	@GetMapping
	public ResponseEntity<List<ClienteDTO>> findAll() {
		List<ClienteDTO> listDTO = clienteService.findAll().stream()
				.map(ClienteDTO::new)
				.collect(Collectors.toList());
		return ResponseEntity.ok().body(listDTO);
	}

	@GetMapping(value = "/search")
	public ResponseEntity<List<ClienteDTO>> search(@RequestParam(value = "nome", defaultValue = "") String nome) {
		List<ClienteDTO> listDTO = clienteService.search(nome).stream()
				.map(ClienteDTO::new)
				.collect(Collectors.toList());
		return ResponseEntity.ok().body(listDTO);
	}

	@PostMapping
	public ResponseEntity<ClienteDTO> create(@Valid @RequestBody ClienteDTO objDTO) {
		ClienteDTO newObjDTO = clienteService.create(objDTO);
		URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
				.buildAndExpand(newObjDTO.getId()).toUri();
		return ResponseEntity.created(uri).body(newObjDTO);
	}

	@PutMapping(value = "/{id}")
	public ResponseEntity<ClienteDTO> update(@PathVariable Integer id, @Valid @RequestBody ClienteDTO objDTO) {
		ClienteDTO updatedDTO = clienteService.update(id, objDTO);
		return ResponseEntity.ok().body(updatedDTO);
	}

	@DeleteMapping(value = "/{id}")
	public ResponseEntity<Void> delete(@PathVariable Integer id) {
		clienteService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
