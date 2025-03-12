package org.terrakube.api.repository;

import java.util.UUID;
import org.terrakube.api.rs.module.Module;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ModuleRepository extends JpaRepository<Module, UUID> {
}
