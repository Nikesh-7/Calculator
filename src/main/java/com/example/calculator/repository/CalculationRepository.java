package com.example.calculator.repository;

import com.example.calculator.model.Calculation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CalculationRepository extends JpaRepository<Calculation, Long> {
    List<Calculation> findAllByOrderByCreatedAtDesc();
}
