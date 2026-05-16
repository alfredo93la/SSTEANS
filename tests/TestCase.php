<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();

        // Make XAMPP's mysql binary available for schema:dump / migrate:fresh
        $xamppMysql = 'C:\\xampp\\mysql\\bin';
        if (PHP_OS_FAMILY === 'Windows' && is_dir($xamppMysql)) {
            $current = getenv('PATH') ?: getenv('Path');
            if (!str_contains($current, $xamppMysql)) {
                putenv('PATH=' . $xamppMysql . ';' . $current);
                putenv('Path=' . $xamppMysql . ';' . $current);
            }
        }
    }
}
