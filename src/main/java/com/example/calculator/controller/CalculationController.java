package com.example.calculator.controller;

import com.example.calculator.model.Calculation;
import com.example.calculator.repository.CalculationRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/calculations")
public class CalculationController {
    private final CalculationRepository repository;

    public CalculationController(CalculationRepository repository) {
        this.repository = repository;
    }

    public record CalculationRequest(
        double firstNumber,
        double secondNumber,
        @NotBlank String operator
    ) {}

    @GetMapping
    public List<Calculation> getHistory() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Calculation calculate(@Valid @RequestBody CalculationRequest request) {
        double a = request.firstNumber();
        double b = request.secondNumber();
        double result;

        switch (request.operator().toUpperCase()) {
            case "ADD" -> result = a + b;
            case "SUBTRACT" -> result = a - b;
            case "MULTIPLY" -> result = a * b;
            case "DIVIDE" -> {
                if (b == 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Division by zero is not allowed");
                result = a / b;
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported operator");
        }

        if (!Double.isFinite(result)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Result is outside the supported range");
        }

        Calculation calculation = new Calculation();
        calculation.setFirstNumber(a);
        calculation.setSecondNumber(b);
        calculation.setOperator(request.operator().toUpperCase());
        calculation.setResult(result);
        return repository.save(calculation);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearHistory() {
        repository.deleteAllInBatch();
    }
}
